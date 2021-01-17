class PopulationManager {
    constructor(students, teachers, courses, options = {
        maxNumPeriods: 6,
        maxNumStudentsPerRoom: 50,
        numPathsInCohort: 3,
    }) {
        const numPaths = teachers.length / options.maxNumPeriods;
        const numStudents = students.length;
        const digitsForTeacher = 3;
        const digitsForCourse = 3;
        const digitsForStudent = 4;
        const digitsForPeriod = digitsForCourse +
            digitsForTeacher +
            options.maxNumStudentsPerRoom * digitsForStudent;
        const digitsForPath = options.maxNumPeriods * digitsForPeriod;
        const digitsForCohort = digitsForPath * options.numPathsInCohort;
        const digitsForTotal = numPaths * digitsForPath;
        const offsetForStudent = digitsForTeacher + digitsForCourse;
        const offsetForCourse = digitsForTeacher;
        this.data = {
            teachers,
            students,
            courses,
        };
        this.teachers = teachers;
        this.students = students;
        this.courses = courses;
        this.helpers = {
            digitsForTeacher,
            digitsForCourse,
            digitsForStudent,
            digitsForPeriod,
            digitsForPath,
            digitsForTotal,
            digitsForCohort,
            maxNumPeriods: options.maxNumPeriods,
            numPaths,
            numStudents,
            maxNumStudentsPerRoom: options.maxNumStudentsPerRoom,
            numPathsInCohort: options.numPathsInCohort,
            numCohorts: Math.ceil(numPaths / options.numPathsInCohort),
            offsetForStudent,
            offsetForCourse,
        };
        this.population = [];
        this.nextGeneration = [];
        this.highestOfGeneration = undefined;
    }
    createPopulation(numDNA) {
        for (let i = 0; i < numDNA; i++) {
            this.population.push(new DNABuilder({
                teachers: this.students,
                students: this.teachers,
                courses: this.courses,
            }, this.helpers).build());
        }
        return this;
    }
    score() {
        for (const DNA of this.population)
            DNA.setScore();
    }
    reproduce() {
        this.highestOfGeneration = undefined;
        this.nextGeneration = [];
        for (const i of this.population) {
            const competitor1 = this.population[getRandomIntBelow(this.population.length)];
            const competitor2 = this.population[getRandomIntBelow(this.population.length)];
            const competitor3 = this.population[getRandomIntBelow(this.population.length)];
            const competitor4 = this.population[getRandomIntBelow(this.population.length)];
            const mate1 = competitor1.score > competitor2.score ? competitor1 : competitor2;
            const mate2 = competitor3.score > competitor4.score ? competitor1 : competitor2;
            if (this.highestOfGeneration === undefined) {
                this.highestOfGeneration = mate1;
            }
            else if (mate1.score > this.highestOfGeneration.score) {
                this.highestOfGeneration = mate1;
            }
            if (mate2.score > this.highestOfGeneration.score) {
                this.highestOfGeneration = mate2;
            }
            let m1 = mate1.asText().split("");
            let m2 = mate2.asText().split("");
            let combo = [];
            for (let j = 1; j < m1.length; j = j + 1) {
                combo.push(m1[j + getRandomIntBelow(9)]);
                combo.push(m2[j + getRandomIntBelow(9)]);
            }
            let comboStr = combo.join("");
            this.nextGeneration.push(new DNA(comboStr, this.helpers, this.data));
        }
        this.population = this.nextGeneration;
    }
    getDNA(index) {
        return this.population[index];
    }
}
class RangeElement {
    constructor(source, [beginning, end], helpers) {
        this.source = source;
        this.range = [beginning, end];
        this.helpers = helpers;
    }
    asText() {
        return this.source.substring(this.range[0], this.range[1]);
    }
}
class DNABuilder {
    constructor(data, helpers) {
        // generates string of random numbers as initial DNA in population
        (this.source = (function () {
            return Array.from({ length: helpers.digitsForTotal }, () => getRandomIntBelow(9)).join("");
        })()),
            helpers;
        this.data = data;
        this.helpers = helpers;
    }
    build() {
        return new DNA(this.source, this.helpers, this.data);
    }
}
class DNA extends RangeElement {
    constructor(source, helpers, data) {
        super(source, 
        // range of dna is the entire string
        [0, helpers.digitsForTotal], helpers);
        this.data = data;
        this.helpers = helpers;
        this.score = undefined;
    }
    getPath(index) {
        return new Path(this.source, [
            this.helpers.digitsForPath * index,
            this.helpers.digitsForPath * index + this.helpers.digitsForPath,
        ], this.helpers);
    }
    getCohort(index) {
        return new Cohort(this.source, [
            this.helpers.digitsForCohort * index,
            this.helpers.digitsForCohort * index + this.helpers.digitsForCohort,
        ], this.helpers);
    }
    getCohorts() {
        const arr = [];
        for (let i = 0; i < this.helpers.numCohorts; i++) {
            arr.push(this.getCohort(i));
        }
        return arr;
    }
    setScore() {
        let iscolationCounter = 0;
        for (const cohort of this.getCohorts()) {
            const periods = cohort.getStudentsInPeriods();
            for (let i = 1; i < periods.length; i++) {
                for (const student of periods[i]) {
                    for (const student2 of periods[i - 1]) {
                        if (student.asText() === student2.asText()) {
                            iscolationCounter++;
                        }
                    }
                }
            }
        }
        this.score =
            iscolationCounter /
                (this.helpers.numStudents * this.helpers.maxNumPeriods);
    }
}
class Cohort extends RangeElement {
    constructor(source, [beginning, end], helpers) {
        super(source, [beginning, end], helpers);
    }
    getPath(pathNum) {
        return new Path(this.source, [
            this.range[0] + this.helpers.digitsForPath * pathNum,
            this.range[0] +
                this.helpers.digitsForPath * pathNum +
                this.helpers.digitsForPath,
        ], this.helpers);
    }
    getPaths() {
        const arr = [];
        for (let i = 0; i < this.helpers.numPathsInCohort; i++) {
            arr.push(this.getPath(i));
        }
        return arr;
    }
    getStudentsInPeriod(index) {
        const arr = [];
        for (const path of this.getPaths()) {
            for (const student of path.getPeriod(index).getStudents()) {
                arr.push(student);
            }
        }
        return arr;
    }
    getStudentsInPeriods() {
        const arr = [];
        for (let i = 0; i < this.helpers.numPathsInCohort; i++) {
            arr.push(this.getStudentsInPeriod(i));
        }
        return arr;
    }
}
class Path extends RangeElement {
    constructor(source, [beginning, end], helpers) {
        super(source, [beginning, end], helpers);
    }
    getPeriod(index) {
        return new Period(this.source, [
            this.range[0] + index * this.helpers.digitsForPeriod,
            this.range[0] +
                index * this.helpers.digitsForPeriod +
                this.helpers.digitsForPeriod,
        ], this.helpers);
    }
    getPeriods() {
        const arr = [];
        for (let i = 0; i < this.helpers.numPathsInCohort; i++) {
            arr.push(this.getPeriod(i));
        }
        return arr;
    }
}
class Period extends RangeElement {
    constructor(source, [beginning, end], helpers) {
        super(source, [beginning, end], helpers);
    }
    getTeacher() {
        return new Period(this.source, [this.range[0], this.range[0] + this.helpers.digitsForTeacher], this.helpers);
    }
    getCourse() {
        return new Period(this.source, [
            this.range[0] + this.helpers.offsetForCourse,
            this.range[0] +
                this.helpers.offsetForCourse +
                this.helpers.digitsForCourse,
        ], this.helpers);
    }
    getStudent(index) {
        return new Student(this.source, [
            this.range[0] +
                this.helpers.offsetForStudent +
                index * this.helpers.digitsForStudent,
            this.range[0] +
                this.helpers.offsetForStudent +
                index * this.helpers.digitsForStudent +
                this.helpers.digitsForStudent,
        ], this.helpers);
    }
    getStudents() {
        const arr = [];
        for (let i = 0; i < this.helpers.maxNumStudentsPerRoom; i++) {
            arr.push(this.getStudent(i));
        }
        return arr;
    }
}
class Teacher extends RangeElement {
    constructor(source, [beginning, end], helpers) {
        super(source, [beginning, end], helpers);
    }
}
class Student extends RangeElement {
    constructor(source, [beginning, end], helpers) {
        super(source, [beginning, end], helpers);
    }
}
class Course extends RangeElement {
    constructor(source, [beginning, end], helpers) {
        super(source, [beginning, end], helpers);
    }
}
function getRandomIntBelow(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
const population = new PopulationManager(Array(1000), Array(50), Array(30)).createPopulation(100);
const viz = document.getElementById("viz");
const dna = document.createElement("div");
const br = () => document.createElement("br");
const makeStudent = (text) => {
    const element = document.createElement("span");
    element.style.color = "black";
    element.innerHTML = text;
    return element;
};
const teacher = (text) => {
    const element = document.createElement("span");
    element.style.color = "red";
    element.innerHTML = text;
    return element;
};
const course = (text) => {
    const element = document.createElement("span");
    element.style.color = "green";
    element.innerHTML = text;
    return element;
};
let i = 0;
function callback() {
    dna.innerHTML = "";
    population.score();
    population.reproduce();
    for (const cohort of population.highestOfGeneration.getCohorts()) {
        for (const path of cohort.getPaths()) {
            for (const period of path.getPeriods()) {
                dna.append(teacher(period.getTeacher().asText()));
                dna.append(course(period.getCourse().asText()));
                for (const student of period.getStudents()) {
                    dna.append(makeStudent(student.asText()));
                }
            }
            dna.append(br());
        }
        dna.append(br());
    }
    viz.appendChild(dna);
    i++;
    console.log(population.highestOfGeneration.score);
    if (i < 1000) {
        window.requestAnimationFrame(callback);
    }
}
window.requestAnimationFrame(callback);
