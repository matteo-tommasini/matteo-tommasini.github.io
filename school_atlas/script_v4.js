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

      // The next code is necessary because some schools are currently listed
      // using PLZ like 
      // 1101 (Alxingergasse 8)
      // 1222 (Natorpgasse 1 and Prandaugasse 5)
      // 1223 (Schüttaustraße 42 and Schödlbergergasse 20)
      // 1225 (Schrebergasse 39)
      var school_PLZ_exploded = school_PLZ.toString().split(""); // 4 digits with indices 0, 1, 2, 3
      if (school_PLZ_exploded[3] != 0) {
        school_PLZ_exploded[3] = 0; // replace with a zero the last digit
      }
      school_PLZ = school_PLZ_exploded.join("");

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
        school_found_categories[category_found] = [];
      }
      if (school_found_categories[category_found].indexOf(school_description) == -1) {
        school_found_categories[category_found].push(school_description);
      }


      if (school_place == "Wien" && school_type == "VS") {  // equivalently: school_description == "Volksschule"
        if (!elementary_schools.hasOwnProperty(school_PLZ)) {
          elementary_schools[school_PLZ] = [];
        }

        elementary_schools[school_PLZ].push({
          "id": school.SKZ,
          "address": school.STR,
          "description": school_description,
          "total_students": school.SCHUELER_INSG,
          "classes": school.KLASSEN, // parameter currently not used, maybe we will use it in the future
          // "male_students": school.SCHUELER_M
          // "female_students": school.SCHUELER_W
        });
      }
    }

    // Now we want to order separately the schools of each PLZ by address
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
        outgoing_schools[category_found].number_of_unknown_values++;
        total_num_of_unknown_values++;
      }
    }

    // estimate how much each unknown value could possibly be by comparing with the total of all confirmed_outgoing_students 
    // and with the number of students in this school (divided by 4 since we are considering only data from Volksschulen (classes 1 to 4) and
    // we are only considering the students finishing their 4th class - we are not taking into account Vorschulen since we have no data about that
    // and we are assuming that the number of classes stays constant in the various years (except for newly created schools: but in this case the first
    // students would normally finish their 4th year when a school is already fully operating since 4 years - so also in this case it could be
    // safe to divide by 4)

    var estimated_missing_outgoing_students = Math.round(number_of_students_in_this_school / 4) - total_confirmed_outgoing_students;
    if (estimated_missing_outgoing_students > 0) {
      if (total_num_of_unknown_values > 0) {
        var average_unknown_value = Math.round(estimated_missing_outgoing_students / total_num_of_unknown_values);
        if (average_unknown_value > 0) {
          for (const school_category in school_categories) {
            outgoing_schools[school_category].estimated_students = average_unknown_value * outgoing_schools[school_category].number_of_unknown_values;
          }
        }
      }
    }
    
  
    var tr_PLZ = document.getElementById("PLZ_" + PLZ);
    for (const school_category in school_categories) {
      if (school_categories[school_category].select_for_this_report) {
        var td = document.getElementById(school_id + "_" + school_category);
        var description_confirmed_students = outgoing_schools[school_category].confirmed_students + " confirmed";
        var description_estimated_students = outgoing_schools[school_category].estimated_students + " estimated";
        td.innerHTML = description_confirmed_students + "<br>" + description_estimated_students;

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
          var percent_confirmed_formatted = td_total.dataset.total_confirmed + " confirmed (" + Math.round(percent_confirmed * 10000) / 100 + "%)";

          var percent_estimated = 1.0 * td_total.dataset.total_estimated / tr_PLZ.dataset.total;
          var percent_estimated_formatted = td_total.dataset.total_estimated + " estimated (" + Math.round(percent_estimated * 10000) / 100 + "%)";
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

  var text_node_address = document.createTextNode(school.address);
  td.appendChild(text_node_address);
  
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
