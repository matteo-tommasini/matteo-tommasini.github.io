// General parameters (December 2025 - these could change in the future because of new versions of the School Atlas of Statistik Austria)

var school_year_description = "data_2024_2025";

const API_all_schools =
  "https://www.statistik.at/gs-atlas/ATLAS_SCHULE_WFS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ATLAS_SCHULE_WFS:ATLAS_SCHULE&outputFormat=application%2Fjson&srsname=EPSG:3857&";
// This is one of the 2 initial APIs called while opening the school atlas at https://www.statistik.at/atlas/schulen/

const API_individual_school =
  "https://www.statistik.at/gs-atlas/ATLAS_SCHULE_WFS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ATLAS_SCHULE_WFS:ATLAS_SCHULE_UEBERTRITT_OUT_WFS&maxFeatures=500&outputFormat=application%2Fjson&viewparams=SKZ:";
// The next API url must be completed by adding the identifier of each individual school that we are interested in (see below)
// the previous URL is only the initial part of the complete API name
// In order to check if this API URL is still correct: open the school atlas (see the previous link),
// then click on any (elementary) school, then choose the option "In Karte" and check the API URL in the browser Network tab

const known_students_in_the_4th_class_in_this_school_year = 18901; // Data from the school year 2024/2025 (see below)
// NOTE: in other data, also from Statistik Austria, you can find a slightly different value (19.054, see below)
// Such small discrepancies can actually be found everywhere in the data of Statistik Austria.

// NOTE: at first, one would simply assume that for each elementary school, the number of outgoing students (including students
// having to repeat the 4th class) could be approximated as the number of students in that school
// divided by the coefficient 4.

// But data actually tells a completely different story:
// - also Vorschulklassen (0. Schulstufe) are part of the data that are provided from the various APIs of the various schools.
// - Vienna is (currently) a growing city, with an increasing number of children.
//   Thus, the initial classes in each school year may include more children than the last classes

// In order to get the exact coefficient, go to
//    https://www.statistik.at/statistiken/bevoelkerung-und-soziales/bildung/schulbesuch/schulen-und-klassen
// then look for the section "Grafiken, Tabellen, Karten"
// then look for the "Detailergebnisse"
// then for the file called "Klassenschüler:innenzahlen im Schuljahr .... (.ods)"

// Download that file. For the school year 2024/2025 the original downloadable file was called "12_-_Klassenschuelerzahlen24.ods", after a few day it was replaced by a corrected version called "KORR_-12_-_Klassensschuelerzahlen24.ods"
// and it was available at https://www.statistik.at/fileadmin/pages/441/12_-_Klassenschuelerzahlen24.ods
// then replaced by https://www.statistik.at/fileadmin/pages/441/KORR_-_12_-_Klassenschuelerzahlen24.ods
// (we write this for reference, in case we need it for future use)

// In the "Tabelle 2", look for all the blocks from the one called "0. Schulstufe (Vorschulstufe)" to the one called "4. Schulstufe"
// For each of them, isolate the line of "Wien" and multiply the values of "Durchschnittliche Schul.zahl" and "Klassen insgesamt"
// (approximate to the nearest integer if need be). We get hence the following data (that we just use as comparison, to see if the number of
// children in the 4th school year in another table (see below) is plausible)

// Vorschule:  2.571 (2.494 in 2023/2024, 2.918 in 2022/2023)
// 1st class: 22.194 (21.656 in 2023/2024, 20.030 in 2022/2023)
// 2nd class: 20.831 (19.625 in 2023/2024, 18.912 in 2022/2023)
// 3rd class: 19.960 (19.316 in 2023/2024, 18.699 in 2022/2023)
// 4th class: 19.054 (18.382 in 2023/2024, 17.866 in 2022/2023) - NOTE: in the table mentioned below we have a value of 18.901
// (this is the small difference mentioned above)
// In order to have good approximations, we just need the total number of students in elementary schools and the amount of
// children in the 4th class. The other data are provided above just to understand what is going on.

// In order to have better estimates on the number of "outgoing students" after the 4th school year, we need also the data
// at the page  https://www.statistik.at/statistiken/bevoelkerung-und-soziales/bildung/schulbesuch/schuelerinnen

// Navigate to the area called "Detailergebnisse", then to the section called "Übertritte und Bildungsverläufe"
// then look for the file called "Übertritte und Vorbildung der Schüler:innen im Schuljahr ... (.ods)"

// Download that file. For the school year 2024/2025 the downloadable file was called 13_-_UEbertritte_Vorbildung_24.ods"
// and it was available at https://www.statistik.at/fileadmin/pages/443/13_-_UEbertritte_Vorbildung_24.ods
// (we write this for reference, in case we need it for future use)

// In that file, go to the "Tabelle 2"
// (called also "Übertritte von Volksschulabgänger:innen (4. Schulstufe)  in die Sekundarstufe I im Schuljahr ...")
// and consider only the data of Vienna (note that the table contains both a column for Vienna with absolute numbers, and a column
// for Vienna with percentages - ignore the one with percentages!)

/* For comparison: these are the old data of 2023/2024:
const known_target_schools = {
  ahs: 8473 + 1100, // AHS-Unterstufe and Modellversuch Mittelschule an AHS
  hs: 7433, // only Mittelschulen
  ss: 89 + 33, // we sum here the Sonderschulen ("ss") and the Sonst. allgem. bildende (Statut)Schulen ("astat")
  vs: 708, // (Wiederholung der 4. Schulstufe)
  // we ignore the "unbekannt" from the table (these represent for example school students who went abroad) - 256
};
The sum of these values (including the "unbekannt") is 18.092 in that table. */

// These are the data of 2024/2025:

const known_target_schools = {
  ahs: 8647 + 1155, // AHS-Unterstufe and Modellversuch Mittelschule an AHS
  hs: 7915, // only Mittelschulen
  ss: 85 + 29, // we sum here the Sonderschulen ("ss") and the Sonst. allgem. bildende (Statut)Schulen ("astat")
  vs: 851, // (Wiederholung der 4. Schulstufe)
  // we ignore the "unbekannt" from the table (these represent, for example school students who went abroad) - 219
};
// The sum of these values (including the "unbekannt") is 18.901 in that table


function collapse_or_expand_children(event) {
  // "this" binds to the clicked element, namely to a row with id of the form "PLZ_...."
  var PLZ = this.id.replace("PLZ_", "");
  var status = this.dataset.status;
  // var description = this.getElementsByClassName("description")[0];

  var children = document.querySelectorAll("[data-plz = '" + PLZ + "']");

  if (status == "expanded") {
    // hide ALL children. If these objects had children themselves and if they were open, we must also reset also their status,
    // so that they will show correctly (as collapsed) the next time that we open their parent (or grandparent)
    for (var i = 0; i < children.length; i++) {
      // children[i].classList.add("hidden-row-line", "chevron-rotated");
      children[i].style.display = "none";
    }
    // this.classList.add("chevron-rotated");
    this.dataset.status = "collapsed";
  } else {
    // i.e. status == "collapsed"
    for (var i = 0; i < children.length; i++) {
      children[i].style.display = "table-row";
    }
    // this.classList.remove("chevron-rotated");
    this.dataset.status = "expanded";
  }
}

// The next categorization was obtained as follows
// (the files listed below are the ones provided in the website of Statistik Austria in December 2025, this could change in the future).
// (1) the types are obtained by interpreting the code of https://www.statistik.at/atlas/schulen/js/custom/guiHelper.js
//     which is one of the JS files used in the page of https://www.statistik.at/atlas/schulen/
// (2) the description is taken by looking at the code of the legend at https://www.statistik.at/atlas/schulen/
//     Each input item has an associated value, which is exactly the key used below in order to associate to each
//     description a list of corresponding types
const school_categories = {
  ahs: {
    select_for_this_report: true,
    description: "Allgemein bildende<br>höhere Schule (AHS)",
    types: ["AHS", "NMSA"],
  },
  hs: {
    select_for_this_report: true,
    description: "Neue Mittelschule / <br> Hauptschule",
    types: ["NMSH", "HS"],
    // NOTE: HS does not exist anymore (in the data of 2024/25), this code is left here just for statistical reasons for past years
    // (and in agreement with the code of Statistik Austria)
  },
  // NOTE: the next ones are actually 2 separate types: "ss" and "astat".
  // We are joining them together only because otherwise the table would become too big
  ss: {
    select_for_this_report: true,
    description:
      "Sonderschule / <br> Sonst. allgemein <br> bildende <br> (Statut)Schule",
    types: ["SS", "ASTAT"],
  },
  vs: {
    select_for_this_report: true,
    description: "Volksschule",
    types: ["VS"],
  },
  // all the next categories are not relevant for this report:
  // they are schools that are not immediate "targets" for students finishing their 4th class in the Volksschule,
  ps: {
    select_for_this_report: false,
    description: "Polytechnische Schule",
    types: ["PS"],
  },
  bs: {
    select_for_this_report: false,
    description: "Berufsschule",
    types: ["BS"],
  },
  bmhs: {
    select_for_this_report: false,
    description: "Berufsbildende mittlere / höhere Schule",
    types: [
      "BMHSP",
      "BMHSK",
      "BMHSS",
      "BMHST",
      "BMHSW",
      "BSTAT",
      "LFHS",
      "LFMS",
      "LHS",
    ],
    // NOTE: LHS seems not to exist anymore (in the data of 2024/25), we also leave this code here for completeness
    // (since the code "LHS" appears in the code of Statistik Austria)
  },
  lms: {
    select_for_this_report: false,
    description: "Lehrerbildende mittlere Schulen",
    types: ["LMS"],
  },
  gks: {
    select_for_this_report: false,
    description: "Ausbildungsstätte im Gesundheitswesen",
    types: ["GKS"],
  },
};

var thead = document.getElementById("thead");
var tr_whole_Vienna = document.getElementById("whole_Vienna");

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
    td.id = "whole_Vienna_" + school_category;
    tr_whole_Vienna.appendChild(td);
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
  try {
    const response = await fetch(API_all_schools);
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
      // which are not standard codes of Bezirks in the form 1xx0 where xx = number of the Bezirk
      var school_PLZ_exploded = school_PLZ.toString().split(""); // 4 digits with indices 0, 1, 2, 3
      if (school_PLZ_exploded[0] == 1) {
        // i.e. Vienna
        if (school_PLZ_exploded[3] != 0) {
          school_PLZ_exploded[3] = 0; // replace with a zero the last digit
        }
        school_PLZ = school_PLZ_exploded.join("");
      }

      var school_type = school.KARTO_TYP;

      var school_description = school.BEZEICHNUNG;

      var category_found = "keine Kategorie";
      for (const school_category in school_categories) {
        if (
          school_categories[school_category].types.indexOf(school_type) != -1
        ) {
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

      if (
        school_found_categories[category_found][school_PLZ].indexOf(
          school_description
        ) == -1
      ) {
        school_found_categories[category_found][school_PLZ].push(
          school_description
        );
      }

      if (school_place == "Wien" && school_type == "VS") {
        if (!elementary_schools.hasOwnProperty(school_PLZ)) {
          elementary_schools[school_PLZ] = [];
        }

        elementary_schools[school_PLZ].push({
          id: school.SKZ,
          address: school.STR,
          description: school_description,
          total_students: school.SCHUELER_INSG,
          // Parameters not used, we leave the code here because it could be useful in the future
          // "classes": school.KLASSEN,
          // "male_students": school.SCHUELER_M,
          // "female_students": school.SCHUELER_W
          // TO DO: add the information about the number of students per class in the information shown to the user
          // and in the information saved in the json files and xls files
        });
      }
    }

    // Now we want to order separately the schools of each PLZ by address.
    for (const PLZ in elementary_schools) {
      elementary_schools[PLZ] = approach2Fn(elementary_schools[PLZ], "address");
    }

    return {
      elementary_schools: elementary_schools,
      school_found_categories: school_found_categories,
    };
  } catch (error) {
    console.error(error.message);
  }
}

function convert_percent(number) {
  return Math.round(number * 1000) / 10;
}

async function compute_estimates(
  list_of_outgoing_schools,
  PLZ,
  school_id,
  expected_outgoing_students,
  school_categories,
  known_percentages_of_target_schools
) {
  var outgoing_schools = {};

  for (const school_category in school_categories) {
    outgoing_schools[school_category] = {
      confirmed_students: 0,
      estimated_students: 0,
      number_of_unknown_values: 0,
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

    // NOTE: sometimes, instead of an exact value, the atlas at
    //   https://www.statistik.at/atlas/schulen/
    // provides the value "≤ 6". For some strange reason, this is manually encoded
    // for the case when the data of the API actually returns a value of zero.
    // See the lines 489-490 of the JS file at this link
    // https://www.statistik.at/atlas/schulen/js/custom/popup/popupHelper.js
    // Because of this, we trust more the source of the API than the actual value "≤ 6" shown in the atlas.

    if (number_of_outgoing_students != 0) {
      outgoing_schools[category_found].confirmed_students +=
        number_of_outgoing_students;
      total_confirmed_outgoing_students += number_of_outgoing_students;
    } else {
      // If we have number_of_outgoing_students == 0, it means that it can be any number between 1 and 6
      // (this is exactly) what is shown in the atlas of Statistik Austria, and it is set to zero
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

  // If all schools have known values, the previous values are fixed, all the data are not obfuscated, and we don't need to do anything at all
  if (total_num_of_unknown_values > 0) {
    var estimated_missing_outgoing_students =
      expected_outgoing_students - total_confirmed_outgoing_students;
    // This number could be negative: it would mean that we have more confirmed outgoing students than we would have expected.
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

          // The differences (summed over all Vienna) are very small in all cases (with data of 2022/23, last time that we checked this)
          // namely: (1): -266, (2): -137, (3): -312
          // Given these results, we opted for (2) as below. Note that (3) is the solution that gets closer to small data (vs and ss)
          // but we prefer to fit (at least as "percentage distance") the bigger data of AHS and neue Mittelschule.

          expected_percentages[school_category] =
            known_percentages_of_target_schools[school_category];

          total_expected_percentages += expected_percentages[school_category];
        }
      }

      // Now that we have a total, we start again
      // (we have to re-parametrize using total_expected_percentages
      // since the sum total_expected_percentages might be different from 1 now).
      for (const school_category in school_categories) {
        if (school_categories[school_category].select_for_this_report) {
          var current_estimate = Math.floor(
            (expected_percentages[school_category] /
              total_expected_percentages) *
              estimated_missing_outgoing_students
          );

          var upper_bound =
            5 * outgoing_schools[school_category].number_of_unknown_values;
          // If the previous integer is positive, it shall be <= 5 * outgoing_schools[school_category].number_of_unknown_values
          // since at most 5 students are obfuscated per each outgoing target school
          // (1 student is already taken care of in the code above (with the ++ increase), hence at most 5 students are estimated)
          if (current_estimate > upper_bound) {
            current_estimate = upper_bound;
          }

          outgoing_schools[school_category].estimated_students =
            current_estimate;
        }
      }
    }
  }

  var estimated_total_outgoing_students = 0;
  for (const school_category in school_categories) {
    estimated_total_outgoing_students +=
      outgoing_schools[school_category].confirmed_students;
    estimated_total_outgoing_students +=
      outgoing_schools[school_category].estimated_students;
  }

  var tr_whole_Vienna = document.getElementById("whole_Vienna");

  var tr_PLZ = document.getElementById("PLZ_" + PLZ);
  for (const school_category in school_categories) {
    if (school_categories[school_category].select_for_this_report) {
      var td = document.getElementById(school_id + "_" + school_category);
      if (estimated_total_outgoing_students > 0) {
        var percent_confirmed_students =
          (1.0 * outgoing_schools[school_category].confirmed_students) /
          estimated_total_outgoing_students;
        var description_confirmed_students =
          outgoing_schools[school_category].confirmed_students +
          " confirmed (" +
          convert_percent(percent_confirmed_students) +
          "%)";

        var percent_estimated_students =
          (1.0 * outgoing_schools[school_category].estimated_students) /
          estimated_total_outgoing_students;
        var description_estimated_students =
          outgoing_schools[school_category].estimated_students +
          " estimated (" +
          convert_percent(percent_estimated_students) +
          "%)";

        td.innerHTML =
          description_confirmed_students +
          "<br>" +
          description_estimated_students;
      } else {
        td.innerHTML = "no data yet";
      }
      var td_total = document.getElementById(
        "PLZ_" + PLZ + "_" + school_category
      );

      td_total.dataset.total_confirmed =
        parseInt(td_total.dataset.total_confirmed, 10) +
        outgoing_schools[school_category].confirmed_students;
      td_total.dataset.total_estimated =
        parseInt(td_total.dataset.total_estimated, 10) +
        outgoing_schools[school_category].estimated_students;
      tr_PLZ.dataset.total =
        parseInt(tr_PLZ.dataset.total, 10) +
        outgoing_schools[school_category].confirmed_students +
        outgoing_schools[school_category].estimated_students;

      // Update also the general total for Vienna

      var td_total_vienna = document.getElementById(
        "whole_Vienna_" + school_category
      );
      td_total_vienna.dataset.total_confirmed =
        parseInt(td_total_vienna.dataset.total_confirmed, 10) +
        outgoing_schools[school_category].confirmed_students;
      td_total_vienna.dataset.total_estimated =
        parseInt(td_total_vienna.dataset.total_estimated, 10) +
        outgoing_schools[school_category].estimated_students;

      tr_whole_Vienna.dataset.total =
        parseInt(tr_whole_Vienna.dataset.total, 10) +
        outgoing_schools[school_category].confirmed_students +
        outgoing_schools[school_category].estimated_students;
    }
  }

  for (const school_category in school_categories) {
    if (school_categories[school_category].select_for_this_report) {
      var td_total = document.getElementById(
        "PLZ_" + PLZ + "_" + school_category
      );
      if (tr_PLZ.dataset.total != 0) {
        var percent_confirmed =
          (1.0 * td_total.dataset.total_confirmed) / tr_PLZ.dataset.total;
        var percent_confirmed_formatted =
          td_total.dataset.total_confirmed +
          " confirmed (" +
          convert_percent(percent_confirmed) +
          "%)";

        var percent_estimated =
          (1.0 * td_total.dataset.total_estimated) / tr_PLZ.dataset.total;
        var percent_estimated_formatted =
          td_total.dataset.total_estimated +
          " estimated (" +
          convert_percent(percent_estimated) +
          "%)";
        td_total.innerHTML =
          percent_confirmed_formatted + "<br>" + percent_estimated_formatted;
      }

      var td_total_vienna = document.getElementById(
        "whole_Vienna_" + school_category
      );
      if (tr_whole_Vienna.dataset.total != 0) {
        var percent_confirmed =
          (1.0 * td_total_vienna.dataset.total_confirmed) /
          tr_whole_Vienna.dataset.total;
        var percent_confirmed_formatted =
          td_total_vienna.dataset.total_confirmed +
          " confirmed (" +
          convert_percent(percent_confirmed) +
          "%)";

        var percent_estimated =
          (1.0 * td_total_vienna.dataset.total_estimated) /
          tr_whole_Vienna.dataset.total;
        var percent_estimated_formatted =
          td_total_vienna.dataset.total_estimated +
          " estimated (" +
          convert_percent(percent_estimated) +
          "%)";
        td_total_vienna.innerHTML =
          percent_confirmed_formatted + "<br>" + percent_estimated_formatted;
      }
    }
  }

  for (const school_category in school_categories) {
    if (school_categories[school_category].select_for_this_report) {
      delete outgoing_schools[school_category].number_of_unknown_values;
    } else {
      delete outgoing_schools[school_category];
    }
  }
  table_data[PLZ][school_id]["interpreted_data"] = outgoing_schools;
}

async function getOutgoingDataOfGivenSchool(
  PLZ,
  school_id,
  expected_outgoing_students,
  school_categories,
  known_percentages_of_target_schools
) {
  const url = API_individual_school + school_id;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      var raw_data = [];
      for (var i = 0; i < data.features.length; i++) {
        school = data.features[i].properties;
        raw_data.push({
          school_id: school.SKZ_LAUFEND, // see next note
          address: school.STR,
          description: school.BEZEICHNUNG,
          type: school.KARTO_TYP,
          amount: school.ANZAHL,
        });
        // NOTE: there is also a key "SKZ_VJ" where VJ means Vorjahr, i.e., the code of the school attended in the previous year,
        // namely the school_id passed as a parameter to the current function (so we can and shall ignore that value)
      }
      table_data[PLZ][school_id]["raw_data"] = raw_data;

      compute_estimates(
        data.features,
        PLZ,
        school_id,
        expected_outgoing_students,
        school_categories,
        known_percentages_of_target_schools
      );

      completed_elementary_schools++;
      span_completed_elementary_schools.innerHTML =
        completed_elementary_schools;

      if (completed_elementary_schools == total_elementary_schools) {
        complete_analysis_and_generate_xlsx();
      }
    })
    .catch(console.error);
}

// TO DO: the initial part of the creation of xlsx and json files should be always executed,
// and then the data shall be downloadable at
// a click of the mouse, instead of having to reload the entire page with the parameter download=...
function generate_and_download_file(download_type) {
  var raw_data = [];
  var interpreted_data = [];
  var json = {};

  raw_data.push([
    "",
    "target school:",
    "id",
    "address",
    "description",
    "type",
    "amount of outgoing students",
  ]);
  // first 2 cells empty on purpose

  interpreted_data.push(["", "", "type", "confirmed", "estimated"]);
  // first 2 cells empty on purpose

  raw_data.push([""]); // add an empty line on purpose (for better readability)
  interpreted_data.push([""]); // add an empty line on purpose (for better readability)

  for (const PLZ in table_data) {
    raw_data.push([PLZ]); // line with just the PLZ
    interpreted_data.push([PLZ]); // line with just the PLZ
    json[PLZ] = {};

    for (var school_id in table_data[PLZ]) {
      if (Object.prototype.hasOwnProperty.call(table_data[PLZ], school_id)) {
        var current_school = table_data[PLZ][school_id];

        json[PLZ][school_id] = {
          info_data: current_school["info_data"],
          target_schools: current_school["raw_data"],
        };

        var info_data = [
          current_school["info_data"]["id"],
          current_school["info_data"]["address"],
          current_school["info_data"]["description"],
        ];

        // add the info_data as a line on the raw_data
        raw_data.push(info_data);

        for (var i = 0; i < current_school["raw_data"].length; i++) {
          var current_target_school = current_school["raw_data"][i];
          var current_raw_data = ["", ""]; // first 2 cells empty on purpose
          current_raw_data.push(current_target_school["school_id"]);
          current_raw_data.push(current_target_school["address"]);
          current_raw_data.push(current_target_school["description"]);
          current_raw_data.push(current_target_school["type"]);
          current_raw_data.push(current_target_school["amount"]);

          raw_data.push(current_raw_data);
        }
        raw_data.push([""]); // add an empty line on purpose (for better readability)

        // add the info_data as a line on the interpreted_data
        interpreted_data.push(info_data);

        var estimates = current_school["interpreted_data"];

        for (var current_type in estimates) {
          if (Object.prototype.hasOwnProperty.call(estimates, current_type)) {
            var current_target = [
              "",
              "",
              current_type,
              estimates[current_type]["confirmed_students"],
              estimates[current_type]["estimated_students"],
            ];
            interpreted_data.push(current_target);
          }
        }
        interpreted_data.push([""]); // add an empty line on purpose (for better readability)
      }
    }
    raw_data.push([""]); // add an empty line on purpose (for better readability)
    interpreted_data.push([""]); // add an empty line on purpose (for better readability)
  }

  var data_name = "data_" + school_year_description;

  // write the temporary file and download it
  if (download_type == "xlsx") {
    var worksheet_raw_data = XLSX.utils.aoa_to_sheet(raw_data);

    var worksheet_interpreted_data = XLSX.utils.aoa_to_sheet(interpreted_data);

    // generate a sort of (temporary) xlsx file
    var workbook = XLSX.utils.book_new();

    // add to the temporary file the 2 tables generated above
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet_raw_data,
      "Raw_data_" + school_year_description
    );

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet_interpreted_data,
      "Interpreted_data_" + school_year_description
    );

    XLSX.writeFile(workbook, data_name + ".xlsx");
    // TO DO: autosize columns?
    // See discussion here: https://github.com/SheetJS/sheetjs/issues/1473
  } else if (download_type == "json") {
    downloadObjectAsJson(json, data_name);
  }
}

// function from https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj, null, 2)); // NOTE: the null, 2 parameters are chosen just for better readability of the output file
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for Firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function complete_analysis_and_generate_xlsx() {
  document.getElementById("loading_schools").style.display = "none";
  document.getElementById("data_loaded").style.display = "inline";

  // generate tables from the raw and interpreted data

  // const queryString = window.location.search;
  // const urlParams = new URLSearchParams(queryString);

  const urlParams = Object.fromEntries(
    new URLSearchParams(window.location.search)
  );

  if (urlParams.hasOwnProperty("download")) {
    if (urlParams.download == "xlsx" || urlParams.download == "json") {
      generate_and_download_file(urlParams.download);
    }
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
      } else {
        current_block = tentative_block;
      }
    }
    // push also the last block to the array with all blocks
    description_in_blocks.push(current_block);
  } else {
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
    var text_node_description = document.createTextNode(
      description_in_blocks[i]
    );
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

var span_completed_elementary_schools = document.getElementById(
  "completed_elementary_schools"
);
var completed_elementary_schools = 0;
var total_elementary_schools = 0;

var table_data = {
  info_data: {},
  raw_data: {},
  interpreted_data: {},
};

// This will be the data needed for the 2 tables of the generated xlsx file
var raw_data = [];
var interpreted_data = [];

(async () => {
  const general_data = await getGeneralDataOfAllSchools();
  const elementary_schools_by_PLZ = general_data.elementary_schools;
  const school_found_categories = general_data.school_found_categories;

  const num_school_found_categories = Object.keys(
    school_found_categories
  ).length;

  var total_students_in_elementary_schools_in_Vienna_in_this_school_year = 0;
  // NOTE: we could also do this a priori using the data in the tables of Statistik Austria, but
  // we prefer to avoid this (because of the small discrepancies in the data in the tables of Statistik Austria)

  // Create all the lines of the table, for the moment with empty data.
  // In addition, compute the total number of students in elementary schools all over Vienna
  for (const PLZ in elementary_schools_by_PLZ) {
    createRowForPLZ(PLZ, school_categories);
    table_data[PLZ] = {};
    for (var i = 0; i < elementary_schools_by_PLZ[PLZ].length; i++) {
      var number_of_students_in_this_school =
        elementary_schools_by_PLZ[PLZ][i].total_students;
      total_students_in_elementary_schools_in_Vienna_in_this_school_year +=
        number_of_students_in_this_school;
      total_elementary_schools++;
      createRowForSchool(
        PLZ,
        elementary_schools_by_PLZ[PLZ][i],
        school_categories
      );
      table_data[PLZ][elementary_schools_by_PLZ[PLZ][i].id] = {
        info_data: {},
        raw_data: {},
        interpreted_data: {},
      };
    }
  }

  document.getElementById("total_elementary_schools_in_Vienna").innerHTML =
    total_elementary_schools;

  var percentage_of_students_in_the_4th_class_in_this_school_year =
    known_students_in_the_4th_class_in_this_school_year /
    total_students_in_elementary_schools_in_Vienna_in_this_school_year;

  var known_percentages_of_target_schools = {};

  for (const school_category in school_categories) {
    if (school_categories[school_category].select_for_this_report) {
      known_percentages_of_target_schools[school_category] =
        known_target_schools[school_category] /
        known_students_in_the_4th_class_in_this_school_year;
    }
  }
  // NOTE: the sum of these percentages does not equal to 1 since we are ignoring the "unknown" values
  // (mostly representing children moving abroad, and children being taught at home).

  document.getElementById("loading_general_data").style.display = "none";

  document.getElementById("loading_schools").style.display = "inline";

  for (const PLZ in elementary_schools_by_PLZ) {
    for (var i = 0; i < elementary_schools_by_PLZ[PLZ].length; i++) {
      var expected_outgoing_students = Math.round(
        percentage_of_students_in_the_4th_class_in_this_school_year *
          elementary_schools_by_PLZ[PLZ][i].total_students
      );

      table_data[PLZ][elementary_schools_by_PLZ[PLZ][i].id]["info_data"] = {
        id: elementary_schools_by_PLZ[PLZ][i].id,
        address: elementary_schools_by_PLZ[PLZ][i].address,
        description: elementary_schools_by_PLZ[PLZ][i].description,
      };

      getOutgoingDataOfGivenSchool(
        PLZ,
        elementary_schools_by_PLZ[PLZ][i].id,
        expected_outgoing_students,
        school_categories,
        known_percentages_of_target_schools
      );
    }
  }
})();

// TO DO: comparison with the previous school years (ideally: elaborated data for the previous years should be uploaded on the website)
// The data saved in json and xls are already saved in the sub-folder "previous_data" in this folder

// TO DO: add the information about the average number of students/class
