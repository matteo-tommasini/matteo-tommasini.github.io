function collapse_or_expand_children(event) {
  // "this" binds to the clicked element, namely to a row with id of the form "PLZ_...."
  var PLZ = this.id.replace("PLZ_", "");
  var status = this.dataset.status;
  // var description = this.getElementsByClassName("description")[0];

  var children = document.querySelectorAll("[data-plz = '" + PLZ + "'");
  
  if (status == "expanded") {  
    // hide ALL children. If these objects had children themselves and if they were open, we must also reset also their status, 
    // so that they will show correctly (as collapsed) the next time that we open their parent (or grandparent)
    for (var i = 0; i < children.length; i++) {
      // children[i].classList.add("hidden-row-line", "chevron-rotated");
      children[i].style.display = "none";
    }
    // this.classList.add("chevron-rotated");
    this.dataset.status = "collapsed";
  }
  else { // i.e. status == "collapsed"
    for (var i = 0; i < children.length; i++) { 
      children[i].style.display = "table-row";
    }
    // this.classList.remove("chevron-rotated");
    this.dataset.status = "expanded";
  }
}

// The next categorization was obtained as follows:
// (1) the types are obtained by interpreting the code of https://www.statistik.at/atlas/schulen/js/custom/guiHelper.js
//     which is one of the JS files used in the page of https://www.statistik.at/atlas/schulen/
// (2) the description is taken by looking at the code of the legend at https://www.statistik.at/atlas/schulen/
//     Each input item has an associated value, which is exactly the key used below in order to associate to each
//     description a list of associated types
const school_categories = {
  "ahs": {
    "select_for_this_report": true,
    "description": "Allgemein bildende höhere Schule",
    "types": ["AHS", "NMSA"]
  },
  "hs": {
    "select_for_this_report": true,
    "description": "Neue Mittelschule / Hauptschule",
    "types": ["NMSH", "HS"]
    // NOTE: HS does not exist anymore (in the data of 2022/23), this code is left here just for statistical reasons for past years
    // (and in agreement with the code of Statistik Austria)
  },
  "vs": {
    "select_for_this_report": true,
    "description": "Volksschule",
    "types": ["VS"]
  },
  "ss": {
    "select_for_this_report": false,
    "description": "Sonderschule",
    "types": ["SS"]
  },
  "ps": {
    "select_for_this_report": false,
    "description": "Polytechnische Schule",
    "types": ["PS"]
  },
  "astat": {
    "select_for_this_report": false,
    "description": "Sonst. allgemein bildende (Statut)Schule",
    "types": ["ASTAT"]
  },
  "bs": {
    "select_for_this_report": false,
    "description": "Berufsschule",
    "types": ["BS"]
  },
  "bmhs": {
    "select_for_this_report": false,
    "description": "Berufsbildende mittlere / höhere Schule",
    "types": ["BMHSP", "BMHSK", "BMHSS", "BMHST", "BMHSW", "BSTAT", "LFHS", "LFMS", "LHS"]
    // NOTE: LHS seems not to exist anymore (in the data of 2022/23), we leave also this code here for completeness of
    // code (since the code "LHS" appears in the code of Statistik Austria)
  },
  "lms": {
    "select_for_this_report": false,
    "description": "Lehrerbildende mittlere Schulen",
    "types": ["LMS"]
  },
  "gks": {
    "select_for_this_report": false,
    "description": "Ausbildungsstätte im Gesundheitswesen",
    "types": ["GKS"]
  }
};

var thead = document.getElementById("thead");
for (const school_category in school_categories) {
  if (school_categories[school_category].select_for_this_report) {
    var th = document.createElement("th");
    var text_node = document.createTextNode(school_categories[school_category].description);
    th.appendChild(text_node);
    thead.appendChild(th);
  }
}

// Function taken from 
// https://www.geeksforgeeks.org/how-to-sort-an-array-of-objects-based-on-a-key-in-javascript/#using-custom-sorting-function
function approach2Fn(arr, k) {
  let temp;
  do {
    temp = false;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i][k].localeCompare(arr[i + 1][k]) > 0) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        temp = true;
      }
    }
  } while (temp);
  return arr;
}

async function getGeneralDataOfAllSchools() {
  const url = "https://www.statistik.at/gs-atlas/ATLAS_SCHULE_WFS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ATLAS_SCHULE_WFS:ATLAS_SCHULE&outputFormat=application%2Fjson&srsname=EPSG:3857&";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    const features = json.features;
    
    var school_found_categories = {};

    var elementary_schools = {};
    for (var i = 0; i < features.length; i++) {
      var school = features[i].properties;

      var school_place = school.ORT;

      var school_PLZ = school.PLZ;

      // The next code is necessary because some schools in Vienna are currently listed
      // using PLZs like 
      // 1101 (Alxingergasse 8)
      // 1222 (Natorpgasse 1 and Prandaugasse 5)
      // 1223 (Schüttaustraße 42 and Schödlbergergasse 20)
      // 1225 (Schrebergasse 39)
      var school_PLZ_exploded = school_PLZ.toString().split(""); // 4 digits with indices 0, 1, 2, 3
      if (school_PLZ_exploded[0] == 1) { // i.e. Vienna
        if (school_PLZ_exploded[3] != 0) {
          school_PLZ_exploded[3] = 0; // replace with a zero the last digit
        }
        school_PLZ = school_PLZ_exploded.join("");
      }

      var school_type = school.KARTO_TYP;

      var school_description = school.BEZEICHNUNG;

      var category_found = "keine Kategorie";
      for (const school_category in school_categories) {
        if (school_categories[school_category].types.indexOf(school_type) != -1) {
          category_found = school_category;
          break;
        }
      }
      
      
      if (!school_found_categories.hasOwnProperty(category_found)) {
        school_found_categories[category_found] = {};
      }

      if (!school_found_categories.hasOwnProperty(school_PLZ)) {
        school_found_categories[category_found][school_PLZ] = [];
      }

      if (school_found_categories[category_found][school_PLZ].indexOf(school_description) == -1) {
        school_found_categories[category_found][school_PLZ].push(school_description);
      }


      if (school_place == "Wien" && school_type == "VS") {
        if (!elementary_schools.hasOwnProperty(school_PLZ)) {
          elementary_schools[school_PLZ] = [];
        }

        elementary_schools[school_PLZ].push({
          "id": school.SKZ,
          "address": school.STR,
          "description": school_description,
          "total_students": school.SCHUELER_INSG,
          // Parameters not used, we leave the code here because it could be useful in the future
          // "classes": school.KLASSEN, 
          // "male_students": school.SCHUELER_M,
          // "female_students": school.SCHUELER_W
        });
      }
    }

    // Now we want to order separately the schools of each PLZ by address.
    for (const PLZ in elementary_schools) {
      elementary_schools[PLZ] = approach2Fn(elementary_schools[PLZ], "address");
    }

    return {
      "elementary_schools": elementary_schools,
      "school_found_categories": school_found_categories
    };
  } 
  catch (error) {
    console.error(error.message);
  }
}

function convert_percent(number) {
  return Math.round(number * 10000) / 100;
}

async function getOutgoingDataOfGivenSchool(PLZ, school_id, number_of_students_in_this_school, school_categories) {
  const url = "https://www.statistik.at/gs-atlas/ATLAS_SCHULE_WFS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ATLAS_SCHULE_WFS:ATLAS_SCHULE_UEBERTRITT_OUT_WFS&maxFeatures=500&outputFormat=application%2Fjson&viewparams=SKZ:" + school_id;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    const features = json.features;
    
    var outgoing_schools = {};
    

    for (const school_category in school_categories) {
      outgoing_schools[school_category] = {
        "confirmed_students": 0,
        "number_of_unknown_values": 0,
        "estimated_students": 0
      };
    }

    var total_confirmed_outgoing_students = 0;
    var total_num_of_unknown_values = 0;
    
    for (var i = 0; i < features.length; i++) {
      var school = features[i].properties;

      var school_type = school.KARTO_TYP;

      var category_found = "keine Kategorie";
      for (const school_category in school_categories) {
        if (school_categories[school_category].types.indexOf(school_type) != -1) {
          category_found = school_category;
          break;
        }
      }

      var number_of_outgoing_students = school.ANZAHL;

      // NOTE: sometimes instead of an exact value, the atlas at
      //   https://www.statistik.at/atlas/schulen/
      // provides the value "≤ 6". For some strange reason, this is manually encoded
      // for the case when the data of the API actually returns a value of zero.
      // See the lines 489-490 of the JS file at this link
      // https://www.statistik.at/atlas/schulen/js/custom/popup/popupHelper.js
      // Because of this, we trust more the source of the API than the actual value "≤ 6" shown in the atlas.
      
      if (number_of_outgoing_students != 0) {
        outgoing_schools[category_found].confirmed_students += number_of_outgoing_students;
        total_confirmed_outgoing_students += number_of_outgoing_students;
      }
      else {
        // If we have number_of_outgoing_students == 0, it means that is can be any number between 1 and 6
        // (this is exactly) what is shown in the atlas of Statistik Austria, and it is put to zero
        // in the API in order to signal to the frontend that it shall display the value "≤ 6".
        // As such: each time that we find 0, it means at least 1 outgoing student is surely there, and additional
        // outgoing students from 0 to 5 could also be obfuscated there.
        // Hence: we increase by 1 the confirmed students, and we track the fact that there COULD be additional students up to 5
        // (so-called estimated students)
        outgoing_schools[category_found].confirmed_students++;
        total_confirmed_outgoing_students++;

        outgoing_schools[category_found].number_of_unknown_values++;
        total_num_of_unknown_values++;
      }
    }

    // Estimate how much each unknown value could possibly be by comparing with the total of all confirmed_outgoing_students 
    // and with the number of students in this school (divided by 4 since we are considering only data from Volksschulen (classes 1 to 4) and
    // we are only considering the students finishing their 4th class - we are not taking into account Vorschulen since we have no data about that
    // and we are assuming that the number of classes stays constant in the various years (except for newly created schools: but in this case the first
    // students would normally finish their 4th year when a school is already fully operating since 4 years - so also in this case it could be
    // safe to divide by 4)

    var estimated_missing_outgoing_students = Math.round(number_of_students_in_this_school / 4) - total_confirmed_outgoing_students;
    if (estimated_missing_outgoing_students > 0) {
      if (total_num_of_unknown_values > 0) {
        var average_unknown_value = estimated_missing_outgoing_students / total_num_of_unknown_values;
        // By construction this is a non-negative float number. If it is zero, it means that
        // we have not missed any students, so we don't need to do anything.
        // If it is positive, it shall be <= 5 since at most 5 students are obfuscated per each outgoing target school
        // (1 student is already taken care of in the code above (with the ++ increase), hence at most 5 students are estimated)
        if (average_unknown_value <= 5.0001) {
          for (const school_category in school_categories) {
            outgoing_schools[school_category].estimated_students = Math.round(average_unknown_value * outgoing_schools[school_category].number_of_unknown_values);
          }
        }
      }
    }
    
    var estimated_total_outgoing_students = 0;
    for (const school_category in school_categories) {
      estimated_total_outgoing_students += outgoing_schools[school_category].confirmed_students; 
      estimated_total_outgoing_students += outgoing_schools[school_category].estimated_students; 
    }
  
    var tr_PLZ = document.getElementById("PLZ_" + PLZ);
    for (const school_category in school_categories) {
      if (school_categories[school_category].select_for_this_report) {
        
        var td = document.getElementById(school_id + "_" + school_category);
        if (estimated_total_outgoing_students > 0) {
          var percent_confirmed_students = 1.0 * outgoing_schools[school_category].confirmed_students / estimated_total_outgoing_students;
          var description_confirmed_students = outgoing_schools[school_category].confirmed_students + " confirmed (" + convert_percent(percent_confirmed_students) + "%)";

          var percent_estimated_students = 1.0 * outgoing_schools[school_category].estimated_students / estimated_total_outgoing_students;
          var description_estimated_students = outgoing_schools[school_category].estimated_students + " estimated (" + convert_percent(percent_estimated_students) + "%)";

          td.innerHTML = description_confirmed_students + "<br>" + description_estimated_students;
        }
        else {
          td.innerHTML = "no data yet";
        }
        var td_total = document.getElementById("PLZ" + "_" + PLZ + "_" + school_category);

        td_total.dataset.total_confirmed = parseInt(td_total.dataset.total_confirmed, 10) + outgoing_schools[school_category].confirmed_students;
        td_total.dataset.total_estimated = parseInt(td_total.dataset.total_estimated, 10) + outgoing_schools[school_category].estimated_students;
        tr_PLZ.dataset.total = 
          parseInt(tr_PLZ.dataset.total, 10) + 
          outgoing_schools[school_category].confirmed_students +
          outgoing_schools[school_category].estimated_students;
      }
    }

    for (const school_category in school_categories) {
      if (school_categories[school_category].select_for_this_report) {
        var td_total = document.getElementById("PLZ" + "_" + PLZ + "_" + school_category);
        if (tr_PLZ.dataset.total != 0) {
          var percent_confirmed = 1.0 * td_total.dataset.total_confirmed / tr_PLZ.dataset.total;
          var percent_confirmed_formatted = td_total.dataset.total_confirmed + " confirmed (" + convert_percent(percent_confirmed) + "%)";

          var percent_estimated = 1.0 * td_total.dataset.total_estimated / tr_PLZ.dataset.total;
          var percent_estimated_formatted = td_total.dataset.total_estimated + " estimated (" + convert_percent(percent_estimated) + "%)";
          td_total.innerHTML = percent_confirmed_formatted  + "<br>" +percent_estimated_formatted;
        }
      }
    }
  } 
  catch (error) {
    console.error(error.message);
  }
}
function createRowForPLZ(PLZ, school_categories) {

  var tbody = document.getElementById("tbody");
  
  var tr = document.createElement("tr");
  tr.classList.add("tr_PLZ");
  tr.id = "PLZ_" + PLZ;
  tr.dataset.total = 0; // NOTE: this is the general total for this PLZ: it includes both confirmed and estimated, for all types of target schools
  tr.dataset.toggle = "collapsed";
  
  var td = document.createElement("td");
  var text_node = document.createTextNode(PLZ);
  td.appendChild(text_node);
  tr.appendChild(td);

  var td_action = document.createElement("td");
  var text_action = document.createTextNode("click to expand/collapse");
  td_action.appendChild(text_action);
  td_action.classList.add("schule");
  tr.appendChild(td_action);

  for (const school_category in school_categories) {
    if (school_categories[school_category].select_for_this_report) {
      var td_category = document.createElement("td");
      td_category.setAttribute("id", "PLZ" + "_" + PLZ + "_" + school_category);
      td_category.dataset.total_confirmed = 0;
      td_category.dataset.total_estimated = 0;
      
      tr.appendChild(td_category);
    }
  }

  tr.addEventListener("click", collapse_or_expand_children);
  tbody.appendChild(tr);
}

function createRowForSchool(PLZ, school, school_categories) {
  var char_limit = 25; // this is the maximum length of a string in order not to overflow the container of class "schule"
  var description_in_blocks = [];
  if (school.description.length > 25) {
    var exploded = school.description.split(" ");
    var current_block = "";
    for (var i = 0; i < exploded.length; i++) {
      var tentative_block = current_block + " " + exploded[i];
      if (tentative_block.length > char_limit) {
        description_in_blocks.push(current_block);
        current_block = exploded[i];
      }
      else {
        current_block = tentative_block;
      }
    }
    // push also the last block to the array with all blocks
    description_in_blocks.push(current_block);
  }
  else {
    description_in_blocks = [school.description];
  }

  
  var tbody = document.getElementById("tbody");

  var tr = document.createElement("tr");
  tr.dataset.plz = PLZ;
  tr.style.display = "none";

  var td_empty = document.createElement("td");
  tr.appendChild(td_empty);

  var td = document.createElement("td");
  td.classList.add("schule");

  var bold_block = document.createElement("b");
  var text_node_address = document.createTextNode(school.address);
  bold_block.appendChild(text_node_address);
  td.appendChild(bold_block);
  
  for (var i = 0; i < description_in_blocks.length; i++) {
    var br = document.createElement("br");
    var text_node_description = document.createTextNode(description_in_blocks[i]);
    td.appendChild(br);
    td.appendChild(text_node_description);
  }
  
  tr.appendChild(td);

  for (const school_category in school_categories) {
    if (school_categories[school_category].select_for_this_report) {
      var td_category = document.createElement("td");
      var text_node = document.createTextNode("loading");
      // NOTE: text nodes in JS have no id property, we have to attach this id to the parent instead
      // text_node.setAttribute("id", school.id + "_" + school_category);
      
      td_category.appendChild(text_node);
      td_category.setAttribute("id", school.id + "_" + school_category);
      
      tr.appendChild(td_category);
    }
  }

  tbody.appendChild(tr);
} 


(async () => {
  const general_data = await getGeneralDataOfAllSchools();
  const elementary_schools_by_PLZ = general_data.elementary_schools;
  const school_found_categories = general_data.school_found_categories;

  const num_school_found_categories = Object.keys(school_found_categories).length;

  console.log(school_found_categories);

  // Create all the lines of the table, for the moment with empty data
  for (const PLZ in elementary_schools_by_PLZ) {
    createRowForPLZ(PLZ, school_categories);
    for (var i = 0; i < elementary_schools_by_PLZ[PLZ].length; i++) {
      createRowForSchool(PLZ, elementary_schools_by_PLZ[PLZ][i], school_categories); 
    }
  }

  for (const PLZ in elementary_schools_by_PLZ) {
    for (var i = 0; i < elementary_schools_by_PLZ[PLZ].length; i++) {
      var number_of_students_in_this_school = elementary_schools_by_PLZ[PLZ][i].total_students;
      getOutgoingDataOfGivenSchool(PLZ, elementary_schools_by_PLZ[PLZ][i].id, number_of_students_in_this_school, school_categories);
    }
  }

})()
