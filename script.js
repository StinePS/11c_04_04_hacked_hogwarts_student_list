"use strict";

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded");
  });

  registerFilter();
  registerSearch();
  registerSort();
  loadJSON();
}

const allStudents = [];
let expelledStudents = [];

// Global default settings
const settings = {
  option: "all-students",
  sortBy: "firstName",
  sortDir: "asc",
};

function registerFilter() {
  // Select-options for selecting filter
  document.querySelector("select").addEventListener("change", (e) => {
    setFilter(e.currentTarget.value);
  });
}

function registerSearch() {
  // Search field
  document.querySelector("#search").addEventListener("input", searchStudent);
}

function registerSort() {
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
    imgUrl: "",
    firstName: "-unknown-",
    middleName: "",
    lastName: "-unknown-",
    nickname: "",
    house: "-unknown-",
    gender: "-unknown-",
    prefect: false,
    squad: false,
  };

  // Create new object with cleaned data and store it in the allStudents array
  // Json-fullname gets trimmed, split and capitalized before sending the data on, while 'house' just gets trimmed and capitalized and ImgUrl gets assigned URL
  jsonData.forEach((element, index) => {
    const student = Object.create(Student);
    student.id = "student" + index;
    const splitUp = element.fullname.trim().split(" ").map(capitalize);
    const trimHouse = element.house.trim();
    student.gender = element.gender.trim();
    student.firstName = getFirstName(splitUp);
    student.middleName = getMiddleName(splitUp);
    student.lastName = getLastName(splitUp);
    student.nickname = getNickname(splitUp);
    student.house = capitalize(trimHouse);
    student.image = getImgUrl(student);
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
      const lastName = splitUp[splitUp.length - 1];
      return lastName;
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

  // HELP! STUDENT.LASTNAME IS UNDEFINED!
  function getImgUrl(student) {
    const { firstName, lastName } = student;
    if (!lastName || !firstName) return undefined;
    // Are there any hyphens in the lastname?
    const hyphenIndex = lastName.indexOf("-");

    // Add imgUrl
    // If there are no hyphens in the last name
    if (hyphenIndex == -1) {
      return student.lastName.toLowerCase() + `_${student.firstName.substring(0, 1).toLowerCase()}.png`;
    } else {
      // If there are hyphens in the last name
      return student.lastName.substring(hyphenIndex + 1).toLowerCase() + `_${student.firstName.substring(0, 1).toLowerCase()}.png`;
    }
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
  } else if (settings.filterBy === "prefect") {
    filteredList = allStudents.filter(isPrefect);
  } else if (settings.filterBy === "squad") {
    filteredList = allStudents.filter(isSquad);
  } else if (settings.filterBy === "expelled") {
    filteredList = allStudents.filter(isExpelled);
  } else if (settings.filterBy === "active") {
    filteredList = allStudents.filter(isActive);
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

function isPrefect(student) {
  return student.prefect === true;
}

function isSquad(student) {
  return student.squad === true;
}

function isExpelled(student) {
  return student.expelled === true;
}

function isActive(student) {
  return student.active === true;
}
// TO DO: Filter functions for prefects, squad, expelled & active students

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
  // Name and house
  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=middleName]").textContent = student.middleName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=nickname]").textContent = student.nickname;
  clone.querySelector("[data-field=house]").textContent = student.house;

  // Gender
  if (student.gender === "boy") {
    clone.querySelector("[data-field=gender]").textContent = " ♂ ";
  } else if (student.gender === "girl") {
    clone.querySelector("[data-field=gender]").textContent = " ♀ ";
  } else {
    clone.querySelector("[data-field=gender]").textContent = "-unknown-";
  }

  // Prefect - add star to each student in the list according to their boolean value
  clone.querySelector("[data-field=prefect]").textContent = `${student.prefect ? "⭐ " : "☆"}`;

  clone.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);

  // Inquisitorial squad - add emoji to each student in the list according to their boolean value
  // clone.querySelector("[data-field=prefect]").textContent = `${student.prefect ? "💀" : "☆"}`;

  // clone.querySelector("[data-field=squad]").addEventListener("click", clickSquad);

  // Eventlistener for Details Modal
  clone.querySelector("[data-field='studentRow']").id = student.id;
  clone.querySelector("[data-field='studentRow']").addEventListener("click", clickStudent);

  // Append clone to list
  document.querySelector("#list tbody").appendChild(clone);

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

  // Turn inq.squad logo on and off
  // function clickSquad() {
  //   // If student is already a member of the inq.squad = remove squad status
  //   if (student.squad === true) {
  //     student.squad = false;
  //   } else {
  //     tryToMakeSquad(student);
  //   }
  //   console.log(`Squad = ${student.squad}`);
  //   buildList();
  // }
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

// Inquisitorial squad logic - IN PROGRESS
// function tryToMakeSquad(selectedStudent) {
//   if (selectedStudent.house === "Slytherin") {
//     makeSquad(selectedStudent);
//   } else if (selectedStudent.blood - status === pure - blood) {
//     makeSquad(selectedStudent);
//   } else {
//     selectedStudent.squad = false;
//     notSquadMaterial();
//   }

//   function makeSquad(selectedStudent) {
//     selectedStudent.squad = true;
//   }

//   function notSquadMaterial() {}
// }

function clickStudent(event) {
  const student = allStudents.find((student) => student.id === event.currentTarget.id);
  let details = document.querySelector("#details_modal");
  details.classList.remove("hidden");
  document.querySelector("[data-field='studentRow']").removeEventListener("click", clickStudent);
  document.querySelector("#details_modal .closebutton").addEventListener("click", closeDetails);

  // Add data to the details modal
  details.querySelector(".student-image").src = `images/${student.image}`;
  details.querySelector(".full-name").textContent = `${student.firstName} ${student.middleName} ${student.lastName}`;
  details.querySelector(".nickname").textContent = `Nickname: ${student.nickname}`;
  details.querySelector(".house").textContent = `House: ${student.house}`;
  details.querySelector(".prefect").textContent = `Prefect: ${student.prefect ? "Yes" : "No"}`;
  // details.querySelector("squad").textContent = `Member of the inquisitorial squad: ${student.squad ? "Yes" : "No"}`;
  // details.querySelector("expelled").textContent = ` Expelled: ${student.expelled ? "Yes" : "No"}`;
  // details.querySelector("blood-status").textContent = ` `;
}

function closeDetails() {
  document.querySelector("#details_modal").classList.add("hidden");
  document.querySelector("#details_modal .closebutton").removeEventListener("click", closeDetails);
}
