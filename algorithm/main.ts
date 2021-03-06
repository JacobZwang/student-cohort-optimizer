type helpers = {
  digitsForTeacher: number;
  digitsForCourse: number;
  digitsForStudent: number;
  digitsForPeriod: number;
  digitsForPath: number;
  digitsForTotal: number;
  maxNumPeriods: number;
  numPaths: number;
  maxNumStudentsPerRoom: number;
  numPathsInCohort: number;
  numCohorts: number;
  offsetForStudent: number;
  offsetForCourse: number;
  digitsForCohort: number;
  numStudents: number;
};

type data = {
  students: Array<any>;
  teachers: Array<any>;
  courses: Array<any>;
};

interface PopulationManager {
  teachers: Array<any>;
  students: Array<any>;
  courses: Array<any>;
  helpers: helpers;
  population: Array<DNA>;
  nextGeneration: Array<DNA>;
  data: data;
  highestOfGeneration: DNA;
  numGeneration: number;
}

class PopulationManager {
  constructor(
    students,
    teachers,
    courses,
    options = {
      maxNumPeriods: 6,
      maxNumStudentsPerRoom: 10,
      numPathsInCohort: 3,
    }
  ) {
    const numPaths = teachers.length;
    const numStudents = students.length;

    const digitsForTeacher = 2;
    const digitsForCourse = 2;
    const digitsForStudent = 4;
    const digitsForPeriod =
      digitsForCourse +
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
    this.numGeneration = 0;
  }
  createPopulation(numDNA) {
    for (let i = 0; i < numDNA; i++) {
      this.population.push(
        new DNABuilder(
          {
            teachers: this.students,
            students: this.teachers,
            courses: this.courses,
          },
          this.helpers
        ).build()
      );
    }
    return this;
  }
  score() {
    for (const DNA of this.population) {
      DNA.setScore();
    }
  }
  reproduce() {
    this.numGeneration = this.numGeneration + 1;
    this.highestOfGeneration = undefined;
    this.nextGeneration = [];
    for (const i of this.population) {
      const competitor1 = this.population[
        getRandomIntBelow(this.population.length)
      ];
      const competitor2 = this.population[
        getRandomIntBelow(this.population.length)
      ];
      const competitor3 = this.population[
        getRandomIntBelow(this.population.length)
      ];
      const competitor4 = this.population[
        getRandomIntBelow(this.population.length)
      ];
      const mate1 =
        competitor1.score > competitor2.score ? competitor1 : competitor2;
      const mate2 =
        competitor3.score > competitor4.score ? competitor1 : competitor2;

      let m1 = mate1.asText().split("");
      let m2 = mate2.asText().split("");
      let combo = [];
      const spliter = getRandomIntBelow(9);
      let counter = 0;
      for (let j = 0; j < m1.length; j = j + 1) {
        if (counter < spliter) {
          combo.push(m1[j]);
        } else {
          combo.push(m2[j]);
          if (counter === spliter) {
            counter = 9;
          }
        }

        // mutate;
        if (getRandomIntBelow(300) === 1) {
          combo.pop();
          combo.push(getRandomIntBelow(9));
        }

        // insert dashes as mutation here
      }

      let comboStr = combo.join("");
      this.nextGeneration.push(new DNA(comboStr, this.helpers, this.data));
    }
    const best = this.getBest();
    if (this.highestOfGeneration < best) {
      this.population.splice(getRandomIntBelow(this.population.length), 1);
      this.population.push(best);
    }
    this.highestOfGeneration = best;
    this.population = this.nextGeneration;
  }
  getBest() {
    let highest = undefined;
    for (let i = 0; i < this.population.length; i++) {
      const best = this.getDNA(i);

      if (highest === undefined) {
        highest = best;
      } else if (best.score > highest.score) {
        highest = best;
      }
    }
    return highest;
  }
  getDNA(index) {
    return this.population[index];
  }
}

interface RangeElement {
  range: [number, number];
  source: string;
  helpers: helpers;
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

interface DNABuilder {
  data: {
    teachers: Array<any>;
    students: Array<any>;
    courses: Array<any>;
  };
  helpers: helpers;
  source: string;
}

class DNABuilder {
  constructor(data, helpers) {
    // generates string of random numbers as initial DNA in population
    (this.source = (function () {
      return Array.from({ length: helpers.digitsForTotal }, () =>
        getRandomIntBelow(9)
      ).join("");
    })()),
      helpers;

    this.data = data;
    this.helpers = helpers;
  }
  build() {
    return new DNA(this.source, this.helpers, this.data);
  }
}

interface DNA {
  data: {
    teachers: Array<any>;
    students: Array<any>;
    courses: Array<any>;
  };
  helpers: helpers;
  score: number;
  info: any;
}

class DNA extends RangeElement {
  constructor(source, helpers, data) {
    super(
      source,
      // range of dna is the entire string
      [0, helpers.digitsForTotal],
      helpers
    );
    this.data = data;
    this.helpers = helpers;
    this.score = undefined;
    this.info = undefined;
  }
  getPath(index: number) {
    return new Path(
      this.source,
      [
        this.helpers.digitsForPath * index,
        this.helpers.digitsForPath * index + this.helpers.digitsForPath,
      ],
      this.helpers
    );
  }
  getPaths() {
    const arr = [];
    for (let i = 0; i < this.helpers.numPaths; i++) {
      arr.push(this.getPath(i));
    }
    return arr;
  }
  getCohort(index) {
    return new Cohort(
      this.source,
      [
        this.helpers.digitsForCohort * index,
        this.helpers.digitsForCohort * index + this.helpers.digitsForCohort,
      ],
      this.helpers
    );
  }
  getCohorts() {
    const arr = [];
    for (let i = 0; i < this.helpers.numCohorts; i++) {
      arr.push(this.getCohort(i));
    }
    return arr;
  }
  setScore() {
    const paths = this.getPaths();
    let studentDoesntExistCount = 0;
    let numStudentsNotInRequiredClasses = 0;
    let numClassesThatDontExist = 0;
    let numTeachersThatDontExist = 0;
    let numStudentsNotIscolated = 0;
    let singularity = 0;

    for (let i = 0; i < this.helpers.maxNumPeriods; i++) {
      for (let j = 1; j < paths.length; j++) {
        // check if the class exists
        if (
          parseInt(paths[j - 1].getPeriod(i).getCourse().asText()) >
          this.data.courses.length
        ) {
          numClassesThatDontExist--;
        }

        // check teacher exists
        if (
          parseInt(paths[j - 1].getPeriod(i).getTeacher().asText()) >
          this.data.teachers.length
        ) {
          numTeachersThatDontExist--;
        }

        for (const student of paths[j - 1].getPeriod(i).getStudents()) {
          // check if student exists, if they don't lower dna score
          if (parseInt(student.asText()) > this.data.students.length) {
            studentDoesntExistCount--;
          }

          // check if student is in required classes
          const parsedStudent = parseInt(student.asText());
          if (this.data.students[parsedStudent] === undefined) {
            numStudentsNotInRequiredClasses--;
          } else if (
            this.data.students[parsedStudent].requiredCourses.some(
              (item) =>
                item ===
                parseInt(paths[j - 1].getPeriod(i).getCourse().asText())
            ) === false
          ) {
            numStudentsNotInRequiredClasses--;
          }

          for (const student2 of paths[j].getPeriod(i).getStudents()) {
            if (student.asText() === student2.asText()) {
              singularity--;
            }
          }
        }
      }
    }

    const cohorts = this.getCohorts();
    for (let i = 1; i < cohorts.length; i++) {
      for (const student of cohorts[i].getStudents()) {
        for (const student2 of cohorts[i - 1].getStudents()) {
          if (student.asText() === student2.asText()) {
            numStudentsNotIscolated--;
          }
        }
      }
    }

    let singularityScore =
      singularity / (this.helpers.numPaths * this.helpers.maxNumPeriods);

    this.score =
      numStudentsNotInRequiredClasses +
      singularity +
      studentDoesntExistCount +
      numClassesThatDontExist +
      numTeachersThatDontExist +
      numStudentsNotIscolated;

    this.info = {
      singularity,
      studentDoesntExistCount,
      numStudentsNotInRequiredClasses,
      numClassesThatDontExist,
      numTeachersThatDontExist,
      numStudentsNotIscolated,
    };
  }
}

class Cohort extends RangeElement {
  constructor(source, [beginning, end], helpers) {
    super(source, [beginning, end], helpers);
  }
  getPath(pathNum: number) {
    return new Path(
      this.source,
      [
        this.range[0] + this.helpers.digitsForPath * pathNum,
        this.range[0] +
          this.helpers.digitsForPath * pathNum +
          this.helpers.digitsForPath,
      ],
      this.helpers
    );
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
  getStudents() {
    const arr = [];
    for (let i = 0; i < this.helpers.numPathsInCohort; i++) {
      for (const student of this.getStudentsInPeriod(i)) arr.push(student);
    }
    return arr;
  }
}

class Path extends RangeElement {
  constructor(source, [beginning, end], helpers) {
    super(source, [beginning, end], helpers);
  }
  getPeriod(index) {
    return new Period(
      this.source,
      [
        this.range[0] + index * this.helpers.digitsForPeriod,
        this.range[0] +
          index * this.helpers.digitsForPeriod +
          this.helpers.digitsForPeriod,
      ],
      this.helpers
    );
  }
  getPeriods() {
    const arr = [];
    for (let i = 0; i < this.helpers.maxNumPeriods; i++) {
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
    return new Period(
      this.source,
      [this.range[0], this.range[0] + this.helpers.digitsForTeacher],
      this.helpers
    );
  }
  getCourse() {
    return new Period(
      this.source,
      [
        this.range[0] + this.helpers.offsetForCourse,
        this.range[0] +
          this.helpers.offsetForCourse +
          this.helpers.digitsForCourse,
      ],
      this.helpers
    );
  }
  getStudent(index) {
    return new Student(
      this.source,
      [
        this.range[0] +
          this.helpers.offsetForStudent +
          index * this.helpers.digitsForStudent,

        this.range[0] +
          this.helpers.offsetForStudent +
          index * this.helpers.digitsForStudent +
          this.helpers.digitsForStudent,
      ],
      this.helpers
    );
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

const population = new PopulationManager(
  Array.from({ length: 200 }, () => ({
    requiredCourses: Array.from({ length: getRandomIntBelow(6) }, () =>
      getRandomIntBelow(10)
    ),
  })),
  Array(10),
  Array(20),
  {
    maxNumPeriods: 3,
    maxNumStudentsPerRoom: 10,
    numPathsInCohort: 2,
  }
).createPopulation(100);

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
const info = document.createElement("div");

let i = 0;
function callback() {
  dna.innerHTML = "";
  population.score();
  population.reproduce();
  info.innerHTML = /*html*/ `
  <br>
  <p>This is an example school with ${
    population.highestOfGeneration.data.courses.length
  } courses, ${population.highestOfGeneration.data.teachers.length} teachers, ${
    population.highestOfGeneration.data.students.length
  } students, and ${
    population.highestOfGeneration.helpers.maxNumPeriods
  } periods. The large number above is a dna strand that represents the entire school schedule. The gaps between the lines represent cohort iscolation. It's format is as follows:</p>
  <p><span style="color: red">teacher id</span><span style="color: green"> course id</span> student id  student id ... <span style="color: red">teacher id</span><span style="color: green"> course id</span> student id  student id ...</p>
  <p><span style="color: red">teacher id</span><span style="color: green"> course id</span> student id  student id ... <span style="color: red">teacher id</span><span style="color: green"> course id</span> student id  student id ...</p>
  <br>
  <h3>total error: ${-population.highestOfGeneration.score}</h3>
  <h3>generation number: ${population.numGeneration}</h3>
  <p>number of students not in required classes: ${-population
    .highestOfGeneration.info.numStudentsNotInRequiredClasses}</p>
  <p>number of students that don't exist: ${-population.highestOfGeneration.info
    .studentDoesntExistCount}</p>
  <p>number of classes that don't exist: ${-population.highestOfGeneration.info
    .numClassesThatDontExist}</p>
  <p>number of teachers that don't exist: ${-population.highestOfGeneration.info
    .numTeachersThatDontExist}</p>
  <p>number of students in 2 places at once: ${-population.highestOfGeneration
    .info.singularity}</p>
  <p>number of students not iscolated: ${-population.highestOfGeneration.info
    .numStudentsNotIscolated}</p>
  `;

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
  viz.append(dna);
  viz.append(info);
  i++;

  window.requestAnimationFrame(callback);
}

window.requestAnimationFrame(callback);
