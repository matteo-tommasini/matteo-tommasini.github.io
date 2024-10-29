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
    "description": "Allgemein bildende<br>höhere Schule (AHS)",
    "types": ["AHS", "NMSA"]
  },
  "hs": {
    "select_for_this_report": true,
    "description": "Neue Mittelschule / <br> Hauptschule",
    "types": ["NMSH", "HS"]
    // NOTE: HS does not exist anymore (in the data of 2022/23), this code is left here just for statistical reasons for past years
    // (and in agreement with the code of Statistik Austria)
  },
  // NOTE: the next ones are actually 2 separate types: "ss" and "astat".
  // We are joining them together only because otherwise the table would become too big
  "ss": {
    "select_for_this_report": true,
    "description": "Sonderschule / <br> Sonst. allgemein <br> bildende <br> (Statut)Schule",
    "types": ["SS", "ASTAT"]
  },
  "vs": {
    "select_for_this_report": true,
    "description": "Volksschule",
    "types": ["VS"]
  },
  // all the next categories are not relevant for this report: 
  // they are schools not immediate "targets" for students finishing their 4th class in the Volksschule,
  "ps": {
    "select_for_this_report": false,
    "description": "Polytechnische Schule",
    "types": ["PS"]
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
var tr_whole_vienna = document.getElementById("whole_vienna");

for (const school_category in school_categories) {
  if (school_categories[school_category].select_for_this_report) {
    var th = document.createElement("th");
    var description = school_categories[school_category].description;
    description = description.replace("<br/>", "<br>");
    description = description.replace("<br />", "<br>");
    // Now description contains only <br> new lines (or none)
    // hence we can split just considering the substring "<br>"
    var description_split = description.split("<br>");
    for (var i = 0; i < description_split.length; i++) {
      if (i > 0) {
        var br = document.createElement("br");
        th.appendChild(br);
      }
      var text_node = document.createTextNode(description_split[i]);
      th.appendChild(text_node);
    }
    thead.appendChild(th);

    var td = document.createElement("td");
    td.dataset.total_confirmed = 0;
    td.dataset.total_estimated = 0;
    td.id = "whole_vienna_" + school_category;
    tr_whole_vienna.appendChild(td);
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
  return Math.round(number * 1000) / 10;
}

async function compute_estimates(list_of_outgoing_schools, PLZ, school_id, expected_outgoing_students, school_categories, known_percentages_of_target_schools) {
  var outgoing_schools = {};

  for (const school_category in school_categories) {
    outgoing_schools[school_category] = {
      "confirmed_students": 0,
      "estimated_students": 0,
      "number_of_unknown_values": 0
    };
  }

  var total_confirmed_outgoing_students = 0;
  var total_num_of_unknown_values = 0;

  for (var i = 0; i < list_of_outgoing_schools.length; i++) {
    var school = list_of_outgoing_schools[i].properties;

    var school_type = school.KARTO_TYP;

    var category_found = "unknown";
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
  // with the expected_outgoing_students provided to this file.

  // If all schools have known values, the previous values are fixed, all the data are not obfuscated and we don't need to do anything at all
  if (total_num_of_unknown_values > 0) {
    var estimated_missing_outgoing_students = expected_outgoing_students - total_confirmed_outgoing_students;
    // This number could be negative: it would mean that we have more confirmed outgoing students than what we would have expected.
    // In that case, we don't have to do anything.
    

    if (estimated_missing_outgoing_students > 0) {

      var expected_percentages = {};
      var total_expected_percentages = 0;
      for (const school_category in school_categories) {
        if (school_categories[school_category].select_for_this_report) {
          // We alter the known percentages in order to take into account the fact that some schools
          // display a large number of obfuscated data in a precise direction (AHS vs Neue Mittelschule).
          
          // 3 possible ways to split the data on multiple schools: we can assign to expected_percentages[school_category]
          // one of the following 3 values:
          
          // (1) known_percentages_of_target_schools[school_category] * outgoing_schools[school_category].number_of_unknown_values;
          // (2) known_percentages_of_target_schools[school_category];
          // (3) outgoing_schools[school_category].number_of_unknown_values;

          // The differences (summed over all Vienna) are very small in all cases (with data of 2022/23)
          // namely: (1): -266, (2): -137, (3): -312
          // Given these results, we opted for (2) as below. Note that (3) is the solution that gets closer to small data (vs and ss)
          // but we prefer to fit (at least as "percentage distance") the bigger data of AHS and neue Mittelschule.

          expected_percentages[school_category] = known_percentages_of_target_schools[school_category];
          
          total_expected_percentages += expected_percentages[school_category];
        }
      }

      // Now that we have a total, we start again 
      // (we have to re-parametrize using total_expected_percentages since the sum total_expected_percentages might be different from 1 now).
      for (const school_category in school_categories) {
        if (school_categories[school_category].select_for_this_report) {
          var current_estimate = Math.floor(expected_percentages[school_category] / total_expected_percentages * estimated_missing_outgoing_students);
        
          var upper_bound = 5 * outgoing_schools[school_category].number_of_unknown_values;
          // If the previous integer is positive, it shall be <= 5 * outgoing_schools[school_category].number_of_unknown_values
          // since at most 5 students are obfuscated per each outgoing target school
          // (1 student is already taken care of in the code above (with the ++ increase), hence at most 5 students are estimated)
          if (current_estimate > upper_bound) {
            current_estimate = upper_bound;
          }

          outgoing_schools[school_category].estimated_students = current_estimate;
        }
      }

    }
  }
  
  var estimated_total_outgoing_students = 0;
  for (const school_category in school_categories) {
    estimated_total_outgoing_students += outgoing_schools[school_category].confirmed_students; 
    estimated_total_outgoing_students += outgoing_schools[school_category].estimated_students; 
  }

  var tr_whole_vienna = document.getElementById("whole_vienna");

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
      var td_total = document.getElementById("PLZ_" + PLZ + "_" + school_category);

      td_total.dataset.total_confirmed = parseInt(td_total.dataset.total_confirmed, 10) + outgoing_schools[school_category].confirmed_students;
      td_total.dataset.total_estimated = parseInt(td_total.dataset.total_estimated, 10) + outgoing_schools[school_category].estimated_students;
      tr_PLZ.dataset.total = 
        parseInt(tr_PLZ.dataset.total, 10) + 
        outgoing_schools[school_category].confirmed_students +
        outgoing_schools[school_category].estimated_students;
      
      // Update also the general total for Vienna

      var td_total_vienna = document.getElementById("whole_vienna_" + school_category);
      td_total_vienna.dataset.total_confirmed = parseInt(td_total_vienna.dataset.total_confirmed, 10) + outgoing_schools[school_category].confirmed_students;
      td_total_vienna.dataset.total_estimated = parseInt(td_total_vienna.dataset.total_estimated, 10) + outgoing_schools[school_category].estimated_students;
      
      tr_whole_vienna.dataset.total = 
        parseInt(tr_whole_vienna.dataset.total, 10) + 
        outgoing_schools[school_category].confirmed_students +
        outgoing_schools[school_category].estimated_students;
        
    }
  }

  for (const school_category in school_categories) {
    if (school_categories[school_category].select_for_this_report) {
      var td_total = document.getElementById("PLZ_" + PLZ + "_" + school_category);
      if (tr_PLZ.dataset.total != 0) {
        var percent_confirmed = 1.0 * td_total.dataset.total_confirmed / tr_PLZ.dataset.total;
        var percent_confirmed_formatted = td_total.dataset.total_confirmed + " confirmed (" + convert_percent(percent_confirmed) + "%)";

        var percent_estimated = 1.0 * td_total.dataset.total_estimated / tr_PLZ.dataset.total;
        var percent_estimated_formatted = td_total.dataset.total_estimated + " estimated (" + convert_percent(percent_estimated) + "%)";
        td_total.innerHTML = percent_confirmed_formatted  + "<br>" +percent_estimated_formatted;
      }

      var td_total_vienna = document.getElementById("whole_vienna_" + school_category);
      if (tr_whole_vienna.dataset.total != 0) {
        var percent_confirmed = 1.0 * td_total_vienna.dataset.total_confirmed / tr_whole_vienna.dataset.total;
        var percent_confirmed_formatted = td_total_vienna.dataset.total_confirmed + " confirmed (" + convert_percent(percent_confirmed) + "%)";

        var percent_estimated = 1.0 * td_total_vienna.dataset.total_estimated / tr_whole_vienna.dataset.total;
        var percent_estimated_formatted = td_total_vienna.dataset.total_estimated + " estimated (" + convert_percent(percent_estimated) + "%)";
        td_total_vienna.innerHTML = percent_confirmed_formatted  + "<br>" +percent_estimated_formatted;
      }
    }
  }

}


async function getOutgoingDataOfGivenSchool(PLZ, school_id, expected_outgoing_students, school_categories, known_percentages_of_target_schools) {
  const url = "https://www.statistik.at/gs-atlas/ATLAS_SCHULE_WFS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ATLAS_SCHULE_WFS:ATLAS_SCHULE_UEBERTRITT_OUT_WFS&maxFeatures=500&outputFormat=application%2Fjson&viewparams=SKZ:" + school_id;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      compute_estimates(data.features, PLZ, school_id, expected_outgoing_students, school_categories, known_percentages_of_target_schools);
      completed_elementary_schools++; 
      span_completed_elementary_schools.innerHTML = completed_elementary_schools;
      if (completed_elementary_schools == total_elementary_schools) {
        document.getElementById("loading_schools").style.display = "none";
        document.getElementById("data_loaded").style.display = "inline";
      }
    })
    .catch(console.error);
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


var span_completed_elementary_schools = document.getElementById("completed_elementary_schools");
var completed_elementary_schools = 0;
var total_elementary_schools = 0;

(async () => {

  const general_data = await getGeneralDataOfAllSchools();
  const elementary_schools_by_PLZ = general_data.elementary_schools;
  const school_found_categories = general_data.school_found_categories;

  const num_school_found_categories = Object.keys(school_found_categories).length;

  var total_students_in_elementary_schools_in_vienna = 0;

  // Create all the lines of the table, for the moment with empty data.
  // In addition, compute the total number of students in elementary schools all over Vienna
  for (const PLZ in elementary_schools_by_PLZ) {
    createRowForPLZ(PLZ, school_categories);
    for (var i = 0; i < elementary_schools_by_PLZ[PLZ].length; i++) {
      var number_of_students_in_this_school = elementary_schools_by_PLZ[PLZ][i].total_students;
      total_students_in_elementary_schools_in_vienna += number_of_students_in_this_school;
      total_elementary_schools++;
      createRowForSchool(PLZ, elementary_schools_by_PLZ[PLZ][i], school_categories); 
    }
  }

  document.getElementById("total_elementary_schools_in_vienna").innerHTML = total_elementary_schools;

  var known_students_in_the_4th_class_in_this_school_year = 17715; 
  // NOTE: in other data, also from Statistik Austria, you can find the value of 17866.
  // Such small discrepancies can actually be found everywhere in the data of Statistik Austria.

  var percentage_of_students_in_the_4th_class_in_this_school_year = 
    known_students_in_the_4th_class_in_this_school_year 
    / total_students_in_elementary_schools_in_vienna;

  // NOTE: at first one would simply assume that for each elementary school the number of outgoing students (including students
  // having to repeat the 4th class) could be approximated as the number of students in that school
  // divided by 4. But data tell a completely different story: for Vienna in the school year 2022/2023 there were a total of 
  // 78.425 students (see https://www.statistik.at/fileadmin/pages/443/2_-_Schueler_Zeitreihe_bis_2022.ods)
  // but there were only 17.715 in the 4th class, hence the correct number to use for dividing is about 4.5. It makes sense 
  // that this is higher than 4 (since most elementary schools have also a Vorschule) but 4.5 is just a random number 
  // that is valid only for this school year and that depends on the fact that Vienna is a growing city, with increasing number of
  // children. Thus, the 1st class in this school year includes a lot more children than the 4th class.
  // The actual amount of children in the various classes in that school year in Vienna
  // is as follows (see https://www.statistik.at/fileadmin/pages/443/4_-_Schueler22_nach_Schulstufen_Alter.ods in the c
  // Tabelle 12 - Schüler:innen im Schuljahr 2022/23 nach Schulstufen - Wien)
  // Vorschule:  2.918	
  // 1st class: 20.030
  // 2nd class: 18.912
  // 3rd class: 18.699
  // 4th class: 17.866 (this is the small difference mentioned above)
  // In order to have good approximations, we just need the total number of students in elementary schools and the amount of
  // children in the 4th class. The other data are provided above just to understand what is going on.

  https://www.statistik.at/fileadmin/pages/443/13_-_UEbertritte_Vorbildung_22.ods


  // Data from the table "Übertritte und Vorbildung der Schüler:innen im Schuljahr 2022/23 (.ods)"
  // from the statistics at 
  //   https://www.statistik.at/statistiken/bevoelkerung-und-soziales/bildung/schulbesuch/schuelerinnen
  // Then navigate to the area called Übertritte und Bildungsverläufe, then choose the file
  // The current direct link to that file is 
  //   https://www.statistik.at/fileadmin/pages/443/13_-_UEbertritte_Vorbildung_22.ods
  // Open that file, navigate to the table called 
  // "Übertritte von Volksschulabgänger.innenn (4. Schulstufe) in die Sekundarstufe I ..."
  // and consider only the data of Vienna
  // These are the data of 2022/2023

  var known_target_schools = {
    "ahs": 8397 + 1069, // AHS-Unterstufe and Modellversuch Mittelschule an AHS
    "hs": 7206,         // only Mittelschulen
    "ss": 117 + 39,     // we sum here the Sonderschulen ("ss") and the Sonst. allgem. bildende (Statut)Schulen ("astat")
    "vs": 654           // we ignore the "unbekannt" from the table
  };

  var known_percentages_of_target_schools = {};

  for (const school_category in school_categories) {
    if (school_categories[school_category].select_for_this_report) {
      known_percentages_of_target_schools[school_category] = known_target_schools[school_category] / known_students_in_the_4th_class_in_this_school_year;
    }
  }
  // NOTE: the sum of these percentages does not equal to 1 since we are ignoring the "unknown" values 
  // (mostly representing children moving abroad, and children being taught at home).

  document.getElementById("loading_general_data").style.display = "none";

  document.getElementById("loading_schools").style.display = "inline";

  for (const PLZ in elementary_schools_by_PLZ) {
    for (var i = 0; i < elementary_schools_by_PLZ[PLZ].length; i++) {
      var expected_outgoing_students = Math.round(percentage_of_students_in_the_4th_class_in_this_school_year * elementary_schools_by_PLZ[PLZ][i].total_students);
      getOutgoingDataOfGivenSchool(PLZ, elementary_schools_by_PLZ[PLZ][i].id, expected_outgoing_students, school_categories, known_percentages_of_target_schools);
    }
  }


})()
