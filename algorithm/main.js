function createSchool(students, teachers, courses) {
  const numPeriods = 6;
  const numPaths = teachers.length / numPeriods;
  const maxStudentsPerClass = 50;

  const digitsForTeacher = 3;
  const digitsForCourse = 3;
  const digitsForStudent = 4;

  const marginToStudents = digitsForTeacher + digitsForCourse;

  const pathLength =
    numPaths *
    numPeriods *
    (digitsForCourse +
      digitsForTeacher +
      maxStudentsPerClass * digitsForStudent);

  this.generation = Array.from({ length: pathLength }, () =>
    getRandomIntBelow(9)
  ).join("");

  this.activePath = undefined;

  createSchool.prototype.setActivePath = function (pathNum) {
    const beginning = pathNum * pathLength;
    this.activePath = this.generation.slice(beginning, beginning + pathLength);
  };

  createSchool.prototype.getStudentsFromActivePath = function () {
    const arr = [];
    for (let i = 0; i < maxStudentsPerClass; i++) {
      const beginning = marginToStudents + i * digitsForStudent;
      arr.push(this.activePath.slice(beginning, beginning + digitsForStudent));
    }
    return arr;
  };
}

const result = (function () {
  const school = new createSchool(Array(1000), Array(100), Array(100));
  school.setActivePath(0);
  console.log(school.getStudentsFromActivePath());
})();

function getRandomIntBelow(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
