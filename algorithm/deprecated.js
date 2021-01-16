const { timeStamp } = require("console");

const testVars = {
  numCourses: 50,
};

class Course {
  constructor(name) {
    this.name = name;
  }
}

class Courses {
  fromIncrementalTestData() {
    return (function () {
      const arr = [];
      for (let i = 0; i < testVars.numCourses; i++) {
        arr.push(new Course(i));
      }
      return arr;
    })();
  }
  fromCSV() {}
  fromJSON() {}
}

class Teacher {
  constructor(name, potentialClasses) {
    this.name = name;
    switch (typeof requiredCourses) {
      // is the user inputs a number it will generate that number of random classes the teacher can teach
      case "number":
        return (function () {
          const arr = Utilities.getRandomIntBelow(testVars.numCourses);
        })();

      // if the user inputs a set it will enumerate it
      case "object":
        return requiredCourses;
    }
  }
}

class Teachers {
  fromIncrementalTestData() {
    return (function () {
      const arr = [];
      for (let i = 0; i < numCourses; i++) {
        arr.push(new Teacher(i, 3));
      }
      return arr;
    })();
  }
  fromCSV() {}
  fromJSON() {}
}

class Student {
  constructor(name, requiredCourses) {
    this.name = name;

    switch (typeof requiredCourses) {
      // is the user inputs a number it will generate random classes for the student
      case "number":
        return (function () {
          const arr = [];
          for (let i = 0; i < requiredCourses; i++) {
            arr.push(
              new Course(Utilities.getRandomIntBelow(testVars.numCourses))
            );
          }
        })();

      // if the user inputs a set it will enumerate it
      case "object":
        return requiredCourses;
    }
  }
}

class Students {
  fromIncrementalTestData(numCourses) {
    const arr = [];
    for (let i = 0; i < numCourses; i++) {
      arr.push(new Student(i));
    }
  }
  fromCSV() {}
  fromJSON() {}
}

class Slot {
  constructor(teacher, students) {
    this.teacher = teacher;
    this.students = students;
  }
}

class Path {
  constructor(numStudents, numTeachers, numCourses) {
    const arr = [];
    const classSize = students.length / teacher.length;
    for (let i = 0; i < teachers.length; i++) {
      arr.push(new Slot(teachers[i], Utilities.getRandomIntBelow(numStudents));
    }
  }
}

class GeneticAlgorithmManager {
  constructor(courses, teachers, students, cohortSize) {
    this.cohortSize = cohortSize;
    this.students = students;
  }
  generatePopulation() {}
  reproduce() {
    return new ReproductionManager();
  }
}

class FitnessManager {
  constructor() {}
}

class ReproductionManager {
  constructor() {}
  select() {}
  reproduce() {}
  mutate() {}
}

class Utilities {
  fromIncrementalTestData(numCourses) {
    return (function () {
      const arr = [];
      for (let i = 0; i < numCourses; i++) {
        arr.push(new Course(i));
      }
      return arr;
    })();
  }
  getRandomIntBelow(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  // Fisher-Yates shuffle taken from http://sedition.com/perl/javascript-fy.html
  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
