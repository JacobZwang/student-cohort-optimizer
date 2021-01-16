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
};

interface PopulationManager {
  teachers: Array<any>;
  students: Array<any>;
  courses: Array<any>;
  helpers: helpers;
  population: Array<DNA>;
}

class PopulationManager {
  constructor(
    students,
    teachers,
    courses,
    options = {
      maxNumPeriods: 6,
      maxNumStudentsPerRoom: 50,
      numPathsInCohort: 3,
    }
  ) {
    const numPaths = teachers.length / options.maxNumPeriods;

    const digitsForTeacher = 3;
    const digitsForCourse = 3;
    const digitsForStudent = 4;
    const digitsForPeriod =
      digitsForCourse +
      digitsForTeacher +
      options.maxNumStudentsPerRoom * digitsForStudent;
    const digitsForPath = options.maxNumPeriods * digitsForPeriod;
    const digitsForTotal = numPaths * digitsForPath;
    const offsetForStudent = digitsForTeacher + digitsForCourse;
    const offsetForCourse = digitsForTeacher;

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
      maxNumPeriods: options.maxNumPeriods,
      numPaths,
      maxNumStudentsPerRoom: options.maxNumStudentsPerRoom,
      numPathsInCohort: options.numPathsInCohort,
      numCohorts: Math.ceil(numPaths / options.numPathsInCohort),
      offsetForStudent,
      offsetForCourse,
    };

    this.population = [];
  }
  createPopulation(numDNA) {
    for (let i = 0; i < numDNA; i++) {
      this.population.push(
        new DNA(
          {
            teachers: this.students,
            students: this.teachers,
            courses: this.courses,
          },
          this.helpers
        )
      );
    }
    return this;
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

interface DNA {
  data: {
    teachers: Array<any>;
    students: Array<any>;
    courses: Array<any>;
  };
  helpers: helpers;
}

class DNA extends RangeElement {
  constructor(data, helpers) {
    super(
      // generates string of random numbers as initial DNA in population
      (function () {
        return Array.from({ length: helpers.digitsForTotal }, () =>
          getRandomIntBelow(9)
        ).join("");
      })(),
      // range of dna is the entire string
      [0, helpers.digitsForTotal],
      helpers
    );

    this.data = data;
    this.helpers = helpers;
  }
  getPath(pathNum: number) {
    return new Path(
      this.source,
      [
        this.helpers.digitsForPath * pathNum,
        this.helpers.digitsForPath * pathNum + this.helpers.digitsForPath,
      ],
      this.helpers
    );
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

function getRandomIntBelow(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const population = new PopulationManager(
  Array(1000),
  Array(50),
  Array(30)
).createPopulation(10);

console.log(population.getDNA(0).asText());

console.log(population.getDNA(0).getPath(0).getPeriod(0).getTeacher().asText());
console.log(population.getDNA(0).getPath(0).getPeriod(0).getTeacher().range);
