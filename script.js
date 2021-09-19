"use strict";

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded");
  });

  registerFilter();
  loadJSON();
}

const allStudents = [];

function registerFilter() {
  document.querySelectorAll("[data-action='filter']").forEach((option) => option.addEventListener("click", selectFilter));
}

async function loadJSON() {
  const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
  const jsonData = await response.json();
  prepareObjects(jsonData);

  //   console.table(allStudents);
}

function prepareObjects(jsonData) {
  // Prototype for all students
  const Student = {
    firstName: "unknown",
    middleName: "",
    lastName: "unknown",
    nickname: "",
    house: "unknown",
  };

  // Create new object with cleaned data and store it in the allStudents array
  // Json-fullname gets trimmed, split and capitalized before sending the data on, while 'house' just gets trimmed and capitalized
  jsonData.forEach((element) => {
    const student = Object.create(Student);
    const splitUp = element.fullname.trim().split(" ").map(capitalize);
    const trimHouse = element.house.trim();
    student.firstName = getFirstName(splitUp);
    student.middleName = getMiddleName(splitUp);
    student.lastName = getLastName(splitUp);
    student.nickName = getNickname(splitUp);
    student.house = capitalize(trimHouse);
    // student.image = getImg
    allStudents.push(student);
  });

  // Capitalize all name-arrays made with split(" ")
  function capitalize(input) {
    if (!input) {
      return "";
    } else if (input.includes("-")) {
      return input.split("-").map(capitalize).join("-");
    }
    return input[0].toUpperCase() + input.substring(1).toLowerCase();
  }

  // FirstName is the first element in the array splitUp
  function getFirstName(splitUp) {
    const firstName = splitUp[0];
    return firstName;
  }

  // If splitUp has more than 2 elements, then the 2nd element is the middle name. If the middle name begins with "" return null - Same for less than 2 elements in splitUp
  function getMiddleName(splitUp) {
    if (splitUp.length > 2) {
      const middleName = splitUp[1];
      if (middleName.startsWith('"')) return "";
      return middleName;
    }
    return "";
  }

  // If splitUp has more than 1 element, then the last element is the last name. If not, then return an empty string
  function getLastName(splitUp) {
    if (splitUp.length > 1) {
      return splitUp[splitUp.length - 1];
    }
    return "null";
  }

  // If splitUp has more than 2 element, then the 2nd element is the nickname. If the nickname begins with " replace them globally with "", otherwise return an empty string (= no nickname)
  function getNickname(splitUp) {
    if (splitUp.length > 2) {
      const nickname = splitUp[1];
      if (nickname.startsWith('"')) {
        return capitalize(nickname.replace(/"/g, ""));
      }
    }
    return "";
  }

  displayList(allStudents);
}

function selectFilter() {
  const filter = event.target.dataset.filter;
  console.log(`Selected filter: ${filter}`);
  filterList(filter);
}

function filterList(filterBy) {
  let filteredList = allStudents;
  if (filterBy === "gryffindor") {
    filteredList = allStudents.filter(isGryff);
  } else if (filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHuff);
  } else if (filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRaven);
  } else if (filterBy === "slytherin") {
    filteredList = allStudents.filter(isSlyth);
  }

  displayList(filteredList);
}

// Filter functions
function isGryff(student) {
  return student.house.toLowerCase() === "gryffindor";
}

function isHuff(student) {
  return student.house.toLowerCase() === "hufflepuff";
}

function isRaven(student) {
  return student.house.toLowerCase() === "ravenclaw";
}

function isSlyth(student) {
  return student.house.toLowerCase() === "slytherin";
}

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=first-name]").textContent = student.firstName;
  clone.querySelector("[data-field=middle-name]").textContent = student.middleName;
  clone.querySelector("[data-field=last-name]").textContent = student.lastName;
  clone.querySelector("[data-field=nickname]").textContent = student.nickname;
  clone.querySelector("[data-field=house]").textContent = student.house;

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
