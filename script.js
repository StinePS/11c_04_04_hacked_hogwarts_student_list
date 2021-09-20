"use strict";

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded");
  });

  registerButtons();
  loadJSON();
}

const allStudents = [];

// Global default settings
const settings = {
  option: "all-students",
  sortBy: "firstName",
  sortDir: "asc",
};

function registerButtons() {
  // Select-options for selecting filter
  document.querySelector("select").addEventListener("change", (e) => {
    setFilter(e.currentTarget.value);
  });
  // Search field
  document.querySelector("#search").addEventListener("input", searchStudent);
  // Sorting-"buttons"
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJSON() {
  const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
  const jsonData = await response.json();

  // When loaded, prepare data objects
  prepareObjects(jsonData);

  // Filter initial data
  setFilter(document.querySelector("select").value);
}

function prepareObjects(jsonData) {
  // Prototype for all students
  const Student = {
    prefect: false,
    gender: "-unknown-",
    firstName: "-unknown-",
    middleName: "",
    lastName: "-unknown-",
    nickname: "",
    house: "-unknown-",
  };

  // Create new object with cleaned data and store it in the allStudents array
  // Json-fullname gets trimmed, split and capitalized before sending the data on, while 'house' just gets trimmed and capitalized
  jsonData.forEach((element) => {
    const student = Object.create(Student);
    const splitUp = element.fullname.trim().split(" ").map(capitalize);
    const trimHouse = element.house.trim();
    student.gender = element.gender.trim();
    student.firstName = getFirstName(splitUp);
    student.middleName = getMiddleName(splitUp);
    student.lastName = getLastName(splitUp);
    student.nickname = getNickname(splitUp);
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

// FILTERING
function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  if (settings.filterBy === "gryffindor") {
    filteredList = allStudents.filter(isGryff);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRaven);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(isSlyth);
  }
  return filteredList;
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
// TO DO: Filter functions for prefects, expelled & active students

// SEARCHING
function searchStudent() {
  let search = document.querySelector("#search").value.toLowerCase();
  let searchResult = allStudents.filter(filterSearch);

  function filterSearch(student) {
    // Searching in firstName, middleName & lastName
    if (student.firstName.toString().toLowerCase().includes(search) || student.middleName.toString().toLowerCase().includes(search) || student.lastName.toString().toLowerCase().includes(search)) {
      return true;
    }
    return false;
  }
  if (search === " ") {
    displayList(allStudents);
  }
  displayList(searchResult);
}

// SORTING
function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // Find "old" sortBy element and remove .sortby
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  if (oldElement) oldElement.classList.remove("sortby");

  // Indicate active sort
  event.target.classList.add("sortby");

  // Toggle the direction of the sorting
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`User selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }
  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    }
    return 1 * direction;
  }
  return sortedList;
}

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function displayList(students) {
  // Clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // Build a new list
  students.forEach(displayStudent);
}

function displayStudent(student) {
  // Create clone
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // Set clone data
  // Gender
  if (student.gender === "boy") {
    clone.querySelector("[data-field=gender]").textContent = " ♂ ";
  } else if (student.gender === "girl") {
    clone.querySelector("[data-field=gender]").textContent = " ♀ ";
  } else {
    clone.querySelector("[data-field=gender]").textContent = "-unknown-";
  }
  // Name and house
  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=middleName]").textContent = student.middleName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=nickname]").textContent = student.nickname;
  clone.querySelector("[data-field=house]").textContent = student.house;

  // Prefect - add star to each student in the list according to their boolean value
  if (student.prefect === true) {
    clone.querySelector("[data-field=prefect]").textContent = " ⭐ ";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = " ☆ ";
  }
  clone.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);

  // Turn prefect stars on and off
  function clickPrefect() {
    // If student is already a prefect = remove prefect status
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakePrefect(student);
    }
    console.log(`Prefect = ${student.prefect}`);
    buildList();
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

// Prefect logic
function tryToMakePrefect(selectedStudent) {
  const allPrefects = allStudents.filter((student) => student.prefect);
  const prefects = allPrefects.filter((prefect) => prefect.house === selectedStudent.house);
  const other = prefects.filter((prefects) => selectedStudent.house && prefects.gender === selectedStudent.gender).shift();

  // If there is another prefect of the same house & gender
  if (other !== undefined) {
    console.log("There can only be two prefects from each house - A boy and a girl");
    removeOther(other);
  } else {
    // There is no problem
    makePrefect(selectedStudent);
  }

  function removeOther(other) {
    // Ask user to ignore or remove 'other'
    document.querySelector("#remove_other_prefect").classList.remove("hidden");
    document.querySelector("#remove_other_prefect .closebutton").addEventListener("click", closeDialogue);
    document.querySelector("#remove_other_prefect .removebutton").addEventListener("click", clickRemoveButton);
    document.querySelector("#remove_other_prefect [data-field=other-prefect]").textContent = `${other.firstName} ${other.lastName}`;
    document.querySelector(".removebutton [data-field=other-prefect]").textContent = other.firstName;

    // If ignore - Do nothing:
    // Clicking closebutton hides modal/dialogue box
    function closeDialogue() {
      document.querySelector("#remove_other_prefect").classList.add("hidden");

      document.querySelector("#remove_other_prefect .closebutton").removeEventListener("click", closeDialogue);
      document.querySelector("#remove_other_prefect .removebutton").removeEventListener("click", clickRemoveButton);
    }

    // If remove other:
    function clickRemoveButton() {
      removePrefect(other);
      makePrefect(selectedStudent);
      buildList();
      closeDialogue();
    }
  }

  function removePrefect(prefectStudent) {
    prefectStudent.prefect = false;
  }

  function makePrefect(student) {
    student.prefect = true;
  }
}
