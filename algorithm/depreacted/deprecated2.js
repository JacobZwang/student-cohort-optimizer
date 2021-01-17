// function createSchool(students, teachers, courses) {
//   const numPeriods = 6;
//   const numPaths = teachers.length / numPeriods;
//   const maxStudentsPerClass = 50;
//   const cohortSize = 3;
//   const numCohorts = Math.ceil(numPaths / cohortSize);

//   const digitsForTeacher = 3;
//   const digitsForCourse = 3;
//   const digitsForStudent = 4;

//   const marginToStudents = digitsForTeacher + digitsForCourse;

//   // the amount of digits needed to represent a period and it's data
//   const digitsForPeriod =
//     digitsForCourse + digitsForTeacher + maxStudentsPerClass * digitsForStudent;

//   // the amount of digits needed to represent a path and it's data WRONG! this is total?
//   const digitsForPath = numPaths * numPeriods * digitsForPeriod;

//   function DNA() {
//     this.generation = Array.from({ length: digitsForPath }, () =>
//       getRandomIntBelow(9)
//     ).join("");

//     this.activePath = undefined;
//     DNA.prototype.setActivePath = function (pathNum) {
//       const beginning = pathNum * digitsForPath;
//       this.activePath = this.generation.slice(
//         beginning,
//         beginning + digitsForPath
//       );
//     };

//     this.activePeriod = undefined;
//     DNA.prototype.setActivePeriod = function (periodNum) {
//       const beginning = periodNum * digitsForPeriod;
//       this.activePeriod = this.activePath.slice(
//         beginning,
//         beginning + digitsForPeriod
//       );
//     };

//     // this is WRONG! students are in each slot, not each path (solved now I think)
//     DNA.prototype.getStudentsFromActivePeriod = function () {
//       const arr = [];
//       for (let i = 0; i < maxStudentsPerClass; i++) {
//         const beginning = marginToStudents + i * digitsForStudent;
//         arr.push(
//           this.activePath.slice(beginning, beginning + digitsForStudent)
//         );
//       }
//       return arr;
//     };
//   }

//   const result = (function () {
//     const school = new DNA();

//     // loops through all cohorts
//     for (let i = 0; i < numCohorts; i++) {
//       const firstPeriodStudents = (function () {
//         for (let j = 0; j < cohortSize; j++) {
//           school.setActivePath(j);
//           school.setActivePeriod(0);
//           school.getStudentsFromActivePeriod();
//         }
//       })();
//     }
//   })();
// }

// createSchool(Array(1000), Array(100), Array(100));

// function getRandomIntBelow(max) {
//   return Math.floor(Math.random() * Math.floor(max));
// }
