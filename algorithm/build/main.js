var Word;
(function (Word) {
    Word[Word["Teacher"] = 0] = "Teacher";
    Word[Word["Course"] = 1] = "Course";
    Word[Word["Student"] = 2] = "Student";
})(Word || (Word = {}));
class DNABuilder {
    constructor(data, utils) {
        this.data = data;
        this.utils = utils;
    }
    getByteType(index) {
        return getByteType(index, this.utils);
    }
    build() {
        // dna is represented as fixed size array of bytes
        const arr = new Uint8ClampedArray(this.utils.bytesPerDNA);
        // generate random data for inital DNA
        for (let i = 0; i < this.utils.bytesPerDNA; i = i + 2) {
            switch (this.getByteType(i)) {
                case Word.Course:
                    const course = getRandomInt(this.data.courses.length);
                    arr[i] = course;
                    arr[i + 1] = course >>> 8;
                    break;
                case Word.Teacher:
                    const teacher = getRandomInt(this.data.teachers.length);
                    arr[i] = teacher;
                    arr[i + 1] = teacher >>> 8;
                    break;
                case Word.Student:
                    const student = getRandomInt(this.data.students.length);
                    arr[i] = student;
                    arr[i + 1] = student >>> 8;
                    break;
            }
        }
        return new DNA({ beginning: 0, length: this.utils.bytesPerDNA }, arr, this.utils, this.data);
    }
}
class Slice {
    constructor(range, source, utils, data) {
        this.range = range;
        this.source = source;
        this.utils = utils;
        this.data = data;
    }
    parseInt(index) {
        return (this.source[index + 1] << 8) + this.source[index];
    }
    getByteType(index) {
        return getByteType(index, this.utils);
    }
}
class DNA extends Slice {
    constructor(range, source, utils, data) {
        super(range, source, utils, data);
    }
    draw(target) {
        const container = document.createElement("div");
        const course = (byte) => {
            const element = document.createElement("span");
            element.style.color = "blue";
            element.classList.add("word");
            element.innerHTML = byte;
            return element;
        };
        const teacher = (byte) => {
            const element = document.createElement("span");
            element.style.color = "red";
            element.classList.add("word");
            element.innerHTML = byte;
            return element;
        };
        const student = (byte) => {
            const element = document.createElement("span");
            element.classList.add("word");
            element.innerHTML = byte;
            return element;
        };
        const br = () => {
            const element = document.createElement("br");
            return element;
        };
        for (let i = 0; i < this.utils.bytesPerDNA; i = i + 2) {
            if (i % this.utils.bytesPerRow === 0 && i !== 0) {
                container.append(br());
            }
            switch (this.getByteType(i)) {
                case Word.Course:
                    container.appendChild(course(this.parseInt(i)));
                    break;
                case Word.Teacher:
                    container.appendChild(teacher(this.parseInt(i)));
                    break;
                case Word.Student:
                    container.appendChild(student(this.parseInt(i)));
                    break;
            }
        }
        target.append(container);
    }
    score() {
        let activeRoomElements = [];
        let numDuplicateStudentsInRooms = 0;
        let activeRoomCourse;
        let activeRoomTeacher;
        let numStudentsInRoomsNotRequested = 0;
        let teachersTeachingClassesTheyCantTeach = 0;
        let numberOf0s = 0;
        let numSpotsShouldntBeEmpty = 0;
        let numSpotsShouldBeEmpty = 0;
        let numberOfClassesWithoutTeachers = 0;
        for (let i = 0; i < this.utils.bytesPerDNA; i = i + 2) {
            const word = this.parseInt(i);
            // keep track of how many empty spots there are
            if (word === 0) {
                numberOf0s++;
            }
            activeRoomElements.push(this.parseInt(i));
            if (word !== 0) {
                if (isEndOfRoom(i, this.utils)) {
                    activeRoomElements = [];
                    activeRoomCourse = this.parseInt(i);
                    activeRoomTeacher = this.parseInt(i + 1);
                }
                if (this.getByteType(i) === Word.Student) {
                    // punish DNA if student appears in room more than once
                    let numDuplicateStudentsInRoom = 0;
                    for (let j = 0; j < activeRoomElements.length; j = j + 2) {
                        if (activeRoomElements[j] === this.parseInt(i)) {
                            numDuplicateStudentsInRoom++;
                        }
                        if (numDuplicateStudentsInRoom > 1) {
                            numDuplicateStudentsInRooms++;
                        }
                    }
                    // punish DNA if student is in a room they did not request
                    let isInCorrectRoom = false;
                    for (let j = 0; j < this.data.students[word].requires.length; j++) {
                        if (this.data.students[word].requires[j] === activeRoomCourse) {
                            isInCorrectRoom = true;
                        }
                    }
                    for (let j = 0; j < this.data.students[word].wants.length; j++) {
                        if (this.data.students[word].wants[j] === activeRoomCourse) {
                            isInCorrectRoom = true;
                        }
                    }
                    if (!isInCorrectRoom) {
                        numStudentsInRoomsNotRequested++;
                    }
                }
            }
            if (this.getByteType(i) === Word.Teacher) {
                // check if teacher is teaching a class they can't teach
                let isTeachingClassTheyCanTeach = false;
                for (let j = 0; j < this.data.teachers[word].canTeach.length; j++) {
                    if (this.data.teachers[word].canTeach[j] === activeRoomCourse) {
                        isTeachingClassTheyCanTeach = true;
                    }
                }
                if (!isTeachingClassTheyCanTeach) {
                    teachersTeachingClassesTheyCantTeach++;
                }
                if (word === 0) {
                    numberOfClassesWithoutTeachers++;
                }
            }
        }
        let expectedNumberOfEmptySlots = this.data.meta.maxNumStudentsPerRoom *
            this.data.meta.numPeriodsAvailable *
            this.data.meta.numRoomsAvailable -
            this.data.students.length;
        // punish DNA if threre are too many empty slots
        if (numberOf0s >
            this.data.meta.maxNumStudentsPerRoom *
                this.data.meta.numPeriodsAvailable *
                this.data.meta.numRoomsAvailable -
                this.data.students.length) {
            numSpotsShouldntBeEmpty = numberOf0s - expectedNumberOfEmptySlots;
            // console.log(numSpotsShouldntBeEmpty);
        }
        // punish DNA if there aren't enough empty slots
        if (numberOf0s < expectedNumberOfEmptySlots - this.data.students.length) {
            numSpotsShouldBeEmpty = expectedNumberOfEmptySlots - numberOf0s;
        }
        // punish DNA if teacher is teaching more than one class at a time
        let numTimesTeacherIsInMultiplePlacesAtOnce = 0;
        // loops over periods
        for (let periodNum = 0; periodNum < this.data.meta.numPeriodsAvailable; periodNum++) {
            let arr = [];
            // loops over rooms in period
            for (let roomNum = 0; roomNum < this.data.meta.numRoomsAvailable; roomNum++) {
                let word = this.parseInt(roomNum * this.utils.bytesPerRow +
                    periodNum * this.utils.bytesPerRoom +
                    this.utils.bytesPerCourse);
                // checks to see if a teacher has already appeared in that period
                for (let k = 0; k < arr.length; k++) {
                    if (arr[k] === word) {
                        numTimesTeacherIsInMultiplePlacesAtOnce++;
                    }
                }
                arr.push(word);
            }
        }
        const total = numStudentsInRoomsNotRequested +
            numDuplicateStudentsInRooms +
            teachersTeachingClassesTheyCantTeach +
            numTimesTeacherIsInMultiplePlacesAtOnce +
            numSpotsShouldntBeEmpty +
            numSpotsShouldBeEmpty +
            numberOfClassesWithoutTeachers;
        this.error = {
            total,
            numDuplicateStudentsInRooms,
            numStudentsInRoomsNotRequested,
            teachersTeachingClassesTheyCantTeach,
            numTimesTeacherIsInMultiplePlacesAtOnce,
            numSpotsShouldntBeEmpty,
            numSpotsShouldBeEmpty,
            numberOfClassesWithoutTeachers,
        };
        return this.error;
    }
}
class PopulationManager {
    constructor(data) {
        const bytesPerTeacher = 2;
        const bytesPerStudent = 2;
        const bytesPerCourse = 2;
        const bytesPerRoom = bytesPerCourse +
            data.meta.numTeachersPerRoom * bytesPerTeacher +
            data.meta.maxNumStudentsPerRoom * bytesPerStudent;
        const bytesPerRow = bytesPerRoom * data.meta.numPeriodsAvailable;
        const bytesPerDNA = bytesPerRow * data.meta.numRoomsAvailable;
        this.data = data;
        this.utils = {
            bytesPerTeacher,
            bytesPerStudent,
            bytesPerCourse,
            bytesPerRoom,
            bytesPerRow,
            bytesPerDNA,
        };
        this.DNABuilder = new DNABuilder(data, this.utils);
        this.population = [];
        this.best = undefined;
        this.worst = undefined;
    }
    getByteType(index) {
        return getByteType(index, this.utils);
    }
    createPopulation(number) {
        for (let i = 0; i < number; i++) {
            this.population.push(this.DNABuilder.build());
        }
    }
    score() {
        for (let i = 0; i < this.population.length; i++) {
            this.population[i].score();
            if (this.best === undefined) {
                this.best = this.population[i];
                this.worst = this.population[i];
            }
            else if (this.population[i].error.total < this.best.error.total) {
                this.best = this.population[i];
            }
            if (this.population[i].error.total > this.best.error.total) {
                this.worst = this.population[i];
            }
        }
    }
    drawBest(target) {
        this.best.draw(target);
    }
    reproduce() {
        const arr = [];
        // // create matting pool with weighted selection
        // for (let i = 0; i < this.population.length; i++) {
        //   const value = this.worst.error.total - this.population[i].error.total;
        //   for (let j = 0; j < value; j++) {
        //     arr.push(this.population[i]);
        //   }
        // }
        const cand1 = this.population[getRandomInt(this.population.length)];
        const cand2 = this.population[getRandomInt(this.population.length)];
        const cand3 = this.population[getRandomInt(this.population.length)];
        const cand4 = this.population[getRandomInt(this.population.length)];
        // create a new population of the same size
        const newPopulation = [];
        for (let i = 0; i < this.population.length; i++) {
            const dna1 = cand1.error.total < cand2.error.total ? cand1 : cand2;
            const dna2 = cand3.error.total < cand4.error.total ? cand3 : cand4;
            //   console.log(i);
            //   console.log(dna2);
            // combine DNA together
            const combinedDNA = new Uint8ClampedArray(this.utils.bytesPerDNA);
            let wordFrom = getRandomInt(this.utils.bytesPerDNA);
            if (wordFrom % 2 !== 0) {
                wordFrom = wordFrom + 1;
            }
            for (let j = 0; j < this.utils.bytesPerDNA; j = j + 2) {
                // choose which DNA the the word comes from
                if (wordFrom > wordFrom) {
                    combinedDNA[j] = dna1.source[j];
                    combinedDNA[j + 1] = dna1.source[j + 1];
                }
                else {
                    combinedDNA[j] = dna2.source[j];
                    combinedDNA[j + 1] = dna2.source[j + 1];
                }
                if (getRandomInt(50) === 1) {
                    switch (this.getByteType(j)) {
                        case Word.Course:
                            const course = getRandomInt(this.data.courses.length);
                            combinedDNA[j] = course;
                            combinedDNA[j + 1] = course >>> 8;
                            break;
                        case Word.Teacher:
                            const teacher = getRandomInt(this.data.teachers.length);
                            combinedDNA[j] = teacher;
                            combinedDNA[j + 1] = teacher >>> 8;
                            break;
                        case Word.Student:
                            const student = getRandomInt(this.data.students.length);
                            combinedDNA[j] = student;
                            combinedDNA[j + 1] = student >>> 8;
                            break;
                    }
                }
                if (getRandomInt(100) === 1) {
                    switch (this.getByteType(j)) {
                        case Word.Student:
                            const student = getRandomInt(this.data.students.length);
                            combinedDNA[j] = 0;
                            combinedDNA[j + 1] = 0;
                            break;
                    }
                }
            }
            newPopulation.push(new DNA({ beginning: 0, length: this.utils.bytesPerDNA }, combinedDNA, this.utils, this.data));
        }
        this.population = newPopulation;
    }
}
function isEndOfRoom(index, utils) {
    return index % utils.bytesPerRoom === 0;
}
function getByteType(index, utils) {
    if (index % utils.bytesPerRoom === 0) {
        return Word.Course;
    }
    else if ((index - 2) % utils.bytesPerRoom === 0) {
        return Word.Teacher;
    }
    else {
        return Word.Student;
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
const sampleData = (function () {
    const numStudents = 90;
    const numTeachers = 10;
    const numCourses = 5;
    const data = {
        meta: {
            maxNumStudentsPerRoom: 10,
            numPeriodsAvailable: 4,
            numRoomsAvailable: 10,
            numTeachersPerRoom: 1,
        },
        students: [],
        teachers: [],
        courses: [],
    };
    // generate students
    for (let i = 1; i < numStudents + 1; i++) {
        data.students.push({
            id: i,
            requires: [
                Array.from(
                // random number of periods
                {
                    // todo ensure the same courses isn't listed twice
                    length: getRandomIntInclusive(1, data.meta.numPeriodsAvailable / 2),
                }, generateStudentClassRequest),
            ],
            wants: [
                Array.from(
                // random number of periods
                {
                    // todo ensure the same courses isn't listed twice
                    length: getRandomIntInclusive(1, data.meta.numPeriodsAvailable / 2),
                }, generateStudentClassRequest),
            ],
        });
    }
    function generateStudentClassRequest() {
        return Array.from(
        // random either 1 or 2 choices
        { length: getRandomIntInclusive(1, 2) }, () => getRandomIntInclusive(1, numCourses));
    }
    for (let i = 1; i < numTeachers + 1; i++) {
        data.teachers.push({
            id: i,
            // can teach random number of courses
            canTeach: Array.from({ length: getRandomIntInclusive(1, 3) }, () => 
            // randomly select courses they can teach
            // todo ensure the same courses isn't listed twice
            getRandomIntInclusive(1, numCourses)),
        });
    }
    for (let i = 1; i < numCourses + 1; i++) {
        data.courses.push({
            id: i,
        });
    }
    return data;
})();
function main() {
    const data = {
        students: [],
        teachers: [
            {
                id: 1,
                canTeach: [1, 2],
            },
            {
                id: 2,
                canTeach: [1, 3],
            },
            {
                id: 3,
                canTeach: [3, 4],
            },
            {
                id: 4,
                canTeach: [1, 4],
            },
            {
                id: 5,
                canTeach: [1, 2],
            },
            {
                id: 6,
                canTeach: [1, 3],
            },
            {
                id: 7,
                canTeach: [3, 4],
            },
            {
                id: 8,
                canTeach: [1, 4],
            },
            {
                id: 9,
                canTeach: [1, 4],
            },
            {
                id: 10,
                canTeach: [1, 2],
            },
        ],
        courses: [0, 1, 2, 3, 4],
        meta: {
            maxNumStudentsPerRoom: 10,
            numPeriodsAvailable: 3,
            numRoomsAvailable: 10,
            numTeachersPerRoom: 1,
        },
    };
    for (let i = 1; i < 90; i++) {
        data.students.push({
            id: i,
            requires: [1, 2],
            wants: [0, 3, 4],
        });
    }
    const population = new PopulationManager(data);
    population.createPopulation(100);
    const info = document.createElement("div");
    const infoElement = (error) => {
        const element = document.createElement("p");
        element.innerHTML = /*html*/ `<p>${error[0]
            .split(/(?=[A-Z])/)
            .join(" ")
            .toLowerCase()} : ${error[1]}</p>`;
        return element;
    };
    function callback() {
        info.innerHTML = "";
        document.getElementById("viz").innerHTML = "";
        population.score();
        for (const error of Object.entries(population.best.error)) {
            info.append(infoElement(error));
        }
        population.drawBest(document.getElementById("viz"));
        population.reproduce();
        document.body.append(info);
        requestAnimationFrame(callback);
    }
    requestAnimationFrame(callback);
}
main();
