/*
 * Add 'Kubernetes GitHub Commands' custom menu
*/
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Kubernetes Github Commands')
  .addItem('Refresh Issues & PRs','refresh')
  .addItem('Refresh Priority Column','SetPriority')
  .addItem('Refresh Kind Column','SetKind')
  .addItem('Refresh SIGs Column','SetSIGs')
  //     .addItem('Get rate quota','getGitHubRateLimit')
  .addToUi();
}

/*
 * Fetch issues, recently closed issues and PRs
 * This function doesn't fetch SIGs, kind and priority (done by dedicated functions)
*/
function refresh() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  var activeOrg = active.getActiveSheet();

  /*
   * Refresh Bug Triage Issues
  */
  active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));

  var url = "https://api.github.com/search/issues?q=repo:kubernetes/kubernetes+type:issue+-label:kind/failing-test+is:open+milestone:v1.18+-label:kind/flake&sort=updated&order=asc&per_page=100"
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());
  for (i = 0; i <= (data.items.length - 1); i++) {
    // Fill information about the issue
    SpreadsheetApp.getActiveSheet().getRange('A' + (i+3)).setValue(data.items[i].html_url);
    SpreadsheetApp.getActiveSheet().getRange('B' + (i+3)).setValue(data.items[i].state);
    SpreadsheetApp.getActiveSheet().getRange('C' + (i+3)).setValue(data.items[i].title);
    SpreadsheetApp.getActiveSheet().getRange('D' + (i+3)).setValue(data.items[i].number);

    // Fill last updated
    var date = new Date(data.items[i].updated_at);
    var formattedDate = Utilities.formatDate(date, 'Etc/GMT', 'yyyy-MM-dd HH:mm')
    SpreadsheetApp.getActiveSheet().getRange('E' + (i+3)).setValue(formattedDate);

    // Fill issue created
    date = new Date(data.items[i].created_at);
    formattedDate = Utilities.formatDate(date, 'Etc/GMT', 'yyyy-MM-dd HH:mm')
    SpreadsheetApp.getActiveSheet().getRange('F' + (i+3)).setValue(formattedDate);

    // Clean SIGs, kind and priority
    SpreadsheetApp.getActiveSheet().getRange('G' + (i+3)).setValue("");
    SpreadsheetApp.getActiveSheet().getRange('H' + (i+3)).setValue("");
    SpreadsheetApp.getActiveSheet().getRange('I' + (i+3)).setValue("");

  }

  /*
   * Refresh Recently Closed Issues
  */
  active.setActiveSheet(active.getSheetByName("Recently Closed Issues"));
  var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
  var now = new Date();
  var tenDaysAgo = new Date(now.getTime() - (MILLIS_PER_DAY * 10));
  var formattedTenDaysAgo = Utilities.formatDate(tenDaysAgo, 'Etc/GMT', 'yyyy-MM-dd');

  var url = "https://api.github.com/search/issues?q=repo:kubernetes/kubernetes+type:issue+is:closed+milestone:v1.18+closed:%3E" + formattedTenDaysAgo + "&sort=updated&order=asc&per_page=100";
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());
  for (i = 0; i <= (data.items.length - 1); i++) {
    // Fill information about the issue
    SpreadsheetApp.getActiveSheet().getRange('A' + (i+3)).setValue(data.items[i].html_url);
    SpreadsheetApp.getActiveSheet().getRange('B' + (i+3)).setValue(data.items[i].state);
    SpreadsheetApp.getActiveSheet().getRange('C' + (i+3)).setValue(data.items[i].title);
    SpreadsheetApp.getActiveSheet().getRange('D' + (i+3)).setValue(data.items[i].number);

    // Fill last updated
    var date = new Date(data.items[i].updated_at);
    var formattedDate = Utilities.formatDate(date, 'Etc/GMT', 'yyyy-MM-dd HH:mm')
    SpreadsheetApp.getActiveSheet().getRange('E' + (i+3)).setValue(formattedDate);

    // Clean SIGs, kind, priority and notes
    SpreadsheetApp.getActiveSheet().getRange('F' + (i+3)).setValue("");
    SpreadsheetApp.getActiveSheet().getRange('G' + (i+3)).setValue("");
    SpreadsheetApp.getActiveSheet().getRange('H' + (i+3)).setValue("");
    SpreadsheetApp.getActiveSheet().getRange('I' + (i+3)).setValue("");
  }

  /*
   * Refresh Bug Triage PRs
  */
  active.setActiveSheet(active.getSheetByName("Bug Triage PRs"));
  var url = "https://api.github.com/search/issues?q=repo:kubernetes/kubernetes+type:pr+is:open+milestone:v1.18&sort=updated&order=asc&per_page=100"
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());
  for (i = 0; i <= (data.items.length - 1); i++) {
    // Fill information about the issue
    SpreadsheetApp.getActiveSheet().getRange('A' + (i+3)).setValue(data.items[i].html_url);
    SpreadsheetApp.getActiveSheet().getRange('B' + (i+3)).setValue(data.items[i].state);
    SpreadsheetApp.getActiveSheet().getRange('C' + (i+3)).setValue(data.items[i].title);
    SpreadsheetApp.getActiveSheet().getRange('D' + (i+3)).setValue(data.items[i].number);

    // Fill last updated
    var date = new Date(data.items[i].updated_at);
    var formattedDate = Utilities.formatDate(date, 'Etc/GMT', 'yyyy-MM-dd HH:mm')
    SpreadsheetApp.getActiveSheet().getRange('E' + (i+3)).setValue(formattedDate);

    // Clean SIGs, kind and priority
    SpreadsheetApp.getActiveSheet().getRange('F' + (i+3)).setValue("");
    SpreadsheetApp.getActiveSheet().getRange('G' + (i+3)).setValue("");
    SpreadsheetApp.getActiveSheet().getRange('H' + (i+3)).setValue("");
  }

  // Return to the spreadsheet that was initially open
  active.setActiveSheet(activeOrg);
}

/*
 * SetPriority fills priority for all issues
 * TODO: There is a bug that would catch only the first priority set and not the current one.
*/
function SetPriority(cell) {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  var activeOrg = active.getActiveSheet();

  /*
   * Set priority for Bug Triage Issues
  */
  active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));
  sheet = SpreadsheetApp.getActiveSheet();
  for (i = 3; i <= active.getSheets()[0].getLastRow(); i++) {
    var url = sheet.getRange('A' + i).getValue();
    if (Boolean(url)) {
      var html = UrlFetchApp.fetch(url).getContentText();
      var priorityregex = (/((priority\/([a-z]*-[a-z]*))|(priority\/([a-z]*)))/);
      var priority = priorityregex.exec(html);
      sheet.getRange('H' + i).setValue(priority);
    }
  }

  /*
   * Set priority for Recently Closed Issues
  */
  active.setActiveSheet(active.getSheetByName("Recently Closed Issues"));
  sheet = SpreadsheetApp.getActiveSheet();
  for (i = 3; i <= active.getSheets()[0].getLastRow(); i++) {
    var url = sheet.getRange('A' + i).getValue();
    if (Boolean(url)) {
      var html = UrlFetchApp.fetch(url).getContentText();
      var priorityregex = (/((priority\/([a-z]*-[a-z]*))|(priority\/([a-z]*)))/);
      var priority = priorityregex.exec(html);
      sheet.getRange('G' + i).setValue(priority);
    }
  }

  // Return to the spreadsheet that was initially open
  active.setActiveSheet(activeOrg);
}

/*
 * SetKind fills kind for all issues
*/
function SetKind(cell) {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  var activeOrg = active.getActiveSheet();

  /*
   * Set kind for Bug Triage Issues
  */
  active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));
  sheet = SpreadsheetApp.getActiveSheet();
  for (i = 3; i <= active.getSheets()[0].getLastRow(); i++) {
    var url = sheet.getRange('A' + i).getValue();
    if (Boolean(url)) {
      var html = UrlFetchApp.fetch(url).getContentText();
      var kindregex = (/(kind\/[a-z]*)/);
      var kind = kindregex.exec(html);
      sheet.getRange('G' + i).setValue(kind);
    }
  }

  /*
   * Set kind for Recently Closed Issues
  */
  active.setActiveSheet(active.getSheetByName("Recently Closed Issues"));
  sheet = SpreadsheetApp.getActiveSheet();
  for (i = 3; i <= active.getSheets()[0].getLastRow(); i++) {
    var url = sheet.getRange('A' + i).getValue();
    if (Boolean(url)) {
      var html = UrlFetchApp.fetch(url).getContentText();
      var kindregex = (/(kind\/[a-z]*)/);
      var kind = kindregex.exec(html);
      sheet.getRange('F' + i).setValue(kind);
    }
  }

  // Return to the spreadsheet that was initially open
  active.setActiveSheet(activeOrg);
}

/*
 * SetSIGs fills SIGs for all issues and PRs
*/
function SetSIGs(cell) {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  var activeOrg = active.getActiveSheet();

  /*
   * Set SIGs for Bug Triage Issues
  */
  active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));
  sheet = SpreadsheetApp.getActiveSheet();
  for (i = 3; i <= active.getSheets()[0].getLastRow(); i++) {
    var url = sheet.getRange('A' + i).getValue();
    if (Boolean(url)) {
      var html = UrlFetchApp.fetch(url).getContentText();
      var sigsregex = (/(data-name=\"sig\/[a-z]+(-[a-z]*)*)\"/g);
      var allSigs = ""
      while((sigs = sigsregex.exec(html)) != null) {
        if (allSigs != "") {
          allSigs += ", "
        }
        var sig = sigs[0];
        sig = sig.replace("data-name=\"", "");
        sig = sig.replace("\"", "");
        allSigs += sig;
      }
      sheet.getRange('I' + i).setValue(allSigs);
    }
  }

  /*
   * Set SIGs for Recently Closed Issues
  */
  active.setActiveSheet(active.getSheetByName("Recently Closed Issues"));
  sheet = SpreadsheetApp.getActiveSheet();
  for (i = 3; i <= active.getSheets()[0].getLastRow(); i++) {
    var url = sheet.getRange('A' + i).getValue();
    if (Boolean(url)) {
      var html = UrlFetchApp.fetch(url).getContentText();
      var sigsregex = (/(data-name=\"sig\/[a-z]+(-[a-z]*)*)\"/g);
      var allSigs = ""
      while((sigs = sigsregex.exec(html)) != null) {
        if (allSigs != "") {
          allSigs += ", "
        }
        var sig = sigs[0];
        sig = sig.replace("data-name=\"", "");
        sig = sig.replace("\"", "");
        allSigs += sig;
      }
      sheet.getRange('H' + i).setValue(allSigs);
    }
  }

  /*
   * Set SIGs for Bug Triage PRs
  */
  active.setActiveSheet(active.getSheetByName("Bug Triage PRs"));
  sheet = SpreadsheetApp.getActiveSheet();
  for (i = 3; i <= active.getSheets()[0].getLastRow(); i++) {
    var url = sheet.getRange('A' + i).getValue();
    if (Boolean(url)) {
      var html = UrlFetchApp.fetch(url).getContentText();
      var sigsregex = (/(data-name=\"sig\/[a-z]+(-[a-z]*)*)\"/g);
      var allSigs = ""
      while((sigs = sigsregex.exec(html)) != null) {
        if (allSigs != "") {
          allSigs += ", "
        }
        var sig = sigs[0];
        sig = sig.replace("data-name=\"", "");
        sig = sig.replace("\"", "");
        allSigs += sig;
      }
      sheet.getRange('G' + i).setValue(allSigs);
    }
  }

  // Return to the spreadsheet that was initially open
  active.setActiveSheet(activeOrg);
}

  /*
    active.setActiveSheet(active.getSheetByName("Bug Triage PRs"));
    sheet = SpreadsheetApp.getActiveSheet();
    r=active.getRange("G3:G60")
    for (i = 60; i >=3; i--) {
    celly = r.getCell(i-2, 1)
    if (celly.isBlank()) {
        var url = sheet.getRange('A' + i).getValue();
        if (Boolean(url)) {
        var html = UrlFetchApp.fetch(url).getContentText();
        var priorityregex = (/((priority\/([a-z]*-[a-z]*))|(priority\/([a-z]*)))/);
        var priority = priorityregex.exec(html);
        sheet.getRange('G' + i).setValue(priority);
        }
    }
    else{
      continue;
    }
}*/




/*
var Issue = function(number, name, url, created, updated, kind, status, lgtm, approved, sigs){

  this.number = number;
  this.name = name;
  this.url = url;
  this.created = created;
  this.updated = updated;
  this.kind = kind;
  this.status = status;
  this.lgtm = lgtm;
  this.approved = approved;
  this.sig = sig;

  this.IssueLabels = function(){
    Logger.log(this.number);
    Logger.log(this.name);
    Logger.log(this.url);
    Logger.log(this.created);
    Logger.log(this.updated);
    Logger.log(this.kind);
    Logger.log(this.status);
    Logger.log(this.lgtm);
    Logger.log(this.approved);
    Logger.log(this.sig);
  }
};



function setkind(cell) {
//  var active = SpreadsheetApp.getActiveSpreadsheet();

  var active = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1jBshIerjPEqFvLLW67brOLexXqeBXF3hJQWPYcJVAb8/edit');
  active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));

  for (i = 3; i <=27; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    var html = UrlFetchApp.fetch(cell).getContentText();
    var priorityregex = (/((priority\/[a-z]*-[a-z]*)|(priority\/[a-z]*))/);
    var sigregex = (/((sig\/[a-z]*-[a-z]*)|(sig\/[a-z]*))/);
    var kindregex = (/(kind\/[a-z]*)/);
//    var priority = priorityregex.exec(html);
//    var sig = sigregex.exec(html);
    var kind = kindregex.exec(html);
//    SpreadsheetApp.getActiveSheet().getRange('G' + i).setValue(priority);
//    SpreadsheetApp.getActiveSheet().getRange('E' + i).setValue(sig);
    SpreadsheetApp.getActiveSheet().getRange('F' + i).setValue(kind);
  }
}


function setsigs(cell){

//  var active = SpreadsheetApp.getActiveSpreadsheet();

  var active = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1jBshIerjPEqFvLLW67brOLexXqeBXF3hJQWPYcJVAb8/edit');
  active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));

  for (i = 3; i <=27; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    var html = UrlFetchApp.fetch(cell).getContentText();
    var priorityregex = (/((priority\/[a-z]*-[a-z]*)|(priority\/[a-z]*))/);
    var sigregex = (/((sig\/[a-z]*-[a-z]*)|(sig\/[a-z]*))/);
    var kindregex = (/(kind\/[a-z]*)/);
//    var priority = priorityregex.exec(html);
//    var sig = sigregex.exec(html);
    var kind = kindregex.exec(html);
//    SpreadsheetApp.getActiveSheet().getRange('G' + i).setValue(priority);
//    SpreadsheetApp.getActiveSheet().getRange('E' + i).setValue(sig);
    SpreadsheetApp.getActiveSheet().getRange('F' + i).setValue(kind);
  }

}

function getStatusandPriority(cell) {
//  var active = SpreadsheetApp.getActiveSpreadsheet();

  var active = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1jBshIerjPEqFvLLW67brOLexXqeBXF3hJQWPYcJVAb8/edit');

  active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));

  for (i = 3; i <=27; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
      var html = UrlFetchApp.fetch(cell).getContentText();
      var priorityregex = (/((priority\/[a-z]*-[a-z]*)|(priority\/[a-z]*))/);
      var priority = priorityregex.exec(html);
      var statusregex = (/((Closed)|(Open))/);
      var status = statusregex.exec(html);
      SpreadsheetApp.getActiveSheet().getRange('B' + i).setValue(status);
      SpreadsheetApp.getActiveSheet().getRange('G' + i).setValue(priority);
  }
}
    /*  ////   PRs are all open lol
  var active = SpreadsheetApp.getActiveSpreadsheet();
  active.setActiveSheet(active.getSheetByName("Bug Triage PRs"));

  for (i = 3; i <=30; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    if (Boolean(cell)){
      var html = UrlFetchApp.fetch(cell).getContentText();
      var statusregex = (/((Closed)|(Open))/);
      var status = statusregex.exec(html);
      SpreadsheetApp.getActiveSheet().getRange('B' + i).setValue(status);
  }
  else{
    break;
    }}

}*/

/*
function getpriority(cell) {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("Bug Triage PRs"));

  for (i = 3; i <=30; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    if (Boolean(cell)){
    var html = UrlFetchApp.fetch(cell).getContentText();
    var priorityregex = (/((priority\/[a-z]*-[a-z]*)|(priority\/[a-z]*))/);
    var priority = priorityregex.exec(html);
    SpreadsheetApp.getActiveSheet().getRange('H' + i).setValue(priority);
  }
  else{
    break;
    }}

  var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));

  for (i = 3; i <=30; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    if (Boolean(cell)){
    var html = UrlFetchApp.fetch(cell).getContentText();
    var priorityregex = (/((priority\/[a-z]*-[a-z]*)|(priority\/[a-z]*))/);
    var priority = priorityregex.exec(html);
    SpreadsheetApp.getActiveSheet().getRange('G' + i).setValue(priority);
  }
  else{
    break;
    }}

}





function getStatusAll(cell) {

    var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("Bug Triage PRs"));
    for (i = 3; i <=30; i++) {
      cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
      if (Boolean(cell)){
      var html = UrlFetchApp.fetch(cell).getContentText();
      var statusregex = (/((Closed)|(Open))/);
      var status = statusregex.exec(html);
      SpreadsheetApp.getActiveSheet().getRange('B' + i).setValue(status);
  }else{
    break;
    }}


    var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));
    for (i = 3; i <=30; i++) {
      cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
      if (Boolean(cell)){
      var html = UrlFetchApp.fetch(cell).getContentText();
      var statusregex = (/((Closed)|(Open))/);
      var status = statusregex.exec(html);
      SpreadsheetApp.getActiveSheet().getRange('B' + i).setValue(status);
  }else{
    break;
    }}


}


// testtest


function getTitlesPR(cell) {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("Bug Triage PRs"));
  for (i = 3; i <=30; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    var html = UrlFetchApp.fetch(cell).getContentText();
    var titleregex = (/js-issue-title">\n(.*)/);
    var title = titleregex.exec(html);
    SpreadsheetApp.getActiveSheet().getRange('O' + i).setValue(title);
  }
}

function getTitlesIssues(cell) {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));

  for (i = 3; i <=30; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    var html = UrlFetchApp.fetch(cell).getContentText();
    var titleregex = (/js-issue-title">\n(.*)/);
    var title = titleregex.exec(html);
    SpreadsheetApp.getActiveSheet().getRange('O' + i).setValue(title);
  }
}



    /*
    var headerRow = Object.keys(data);
    var row = headerRow.map(function(key){ return data[key]});

var contents = [
 headerRow,
 row
];

var ss = SpreadsheetApp.getActive();
var rng = ss.getActiveSheet().getRange(1, 1, contents.length, headerRow.length )
rng.setValues(contents)


    var array = [];
array.push(data);
SpreadsheetApp.getActiveSheet().appendRow(array)

  //  var gamwto = JSON.stringify(data.items[i].updated_at);
    var priorityregex = (/((priority\/[a-z]*-[a-z]*)|(priority\/[a-z]*))/);
    var priority = priorityregex.exec(data.items[i].labels);
    var updatedregex = (/(\d{4}-d{2}-d{2})/);  //(\d{2}:\d{2}:\d{2}\sGMT)|(.*,)
    var updated = updatedregex.exec(data.items[i].updated_at);






function RefreshImports() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;             // Wait up to 5s for previous refresh to end.
  var id = "1jBshIerjPEqFvLLW67brOLexXqeBXF3hJQWPYcJVAb8";
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheetByName("Bug Triage PRs");
  var dataRange = sheet.getDataRange();
  var formulas = dataRange.getFormulas();
  var content = "";
  var now = new Date();
  var time = now.getTime();
//  var re = /.*[^a-z0-9]import(?:xml|data|feed|html|range)\(.*gi;
  var re2 = /((\?|&)(update=[0-9]*))/gi;
  var re3 = /(",)/gi;

  for (var row=0; row<formulas.length; row++) {
    for (var col=0; col<formulas[0].length; col++) {
      content = formulas[row][col];
      if (content != "") {
        var match = content.search(re);
        if (match !== -1 ) {
          // import function is used in this cell
          var updatedContent = content.toString().replace(re2,"$2update=" + time);
          if (updatedContent == content) {
            // No querystring exists yet in url
            updatedContent = content.toString().replace(re3,"?update=" + time + "$1");
          }
          // Update url in formula with querystring param
          sheet.getRange(row+1, col+1).setFormula(updatedContent);
        }
      }
    }
  }

  // Done refresh; release the lock.
  lock.releaseLock();

  // Show last updated time on sheet somewhere
  sheet.getRange(40,2).setValue("Rates were last updated at " + now.toLocaleTimeString())
}


// priority - lost formula: =IFERROR(ArrayFormula(REGEXEXTRACT(JOIN(", ", importxml(A5, "//a[@class='lh-condensed-ultra']")) , "priority\/(\w*)")), "")
// sigs - lost formula: =IFERROR(ArrayFormula(TRIM(REGEXREPLACE(CONCATENATE(IMPORTXML(A3, "//a[@class='sidebar-labels-style box-shadow-none width-full d-block IssueLabel v-align-text-top tooltipped tooltipped-w']") & " ") , "((kind/\w*-test)|(kind/\w*)|(lifecycle/\w*)|(area/\w*-\w*)|(area/\w*)|(needs-sig)|(priority/\w*-\w*)|(sig/))", ""))), "")


/* code graveyard

  var html = UrlFetchApp.fetch(A3).getContentText();
  var re = (/(priority\/[a-z]*)/);
  var priority = re.exec(html);
//  return priority;
//  var priority = html.match(/priority-/g);
//  return priority;
  SpreadsheetApp.getActiveSheet().getRange('H15).setValue(priority);
//  SpreadsheetApp.getActiveSheet().getRange('C24').setValue(label2);



function getsig(cell) {
  for (i = 3; i <=30; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    var html = UrlFetchApp.fetch(cell).getContentText();
    var re = (/((sig\/[a-z]*-[a-z]*)|(sig\/[a-z]*))/);
    var sig = re.exec(html);
    SpreadsheetApp.getActiveSheet().getRange('H' + i).setValue(sig);
  }
}

function getkind(cell) {
  for (i = 3; i <=30; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    var html = UrlFetchApp.fetch(cell).getContentText();
    var re = (/(kind\/[a-z]*)/);
    var kind = re.exec(html);
    SpreadsheetApp.getActiveSheet().getRange('H' + i).setValue(kind);
  }
}



function getpriorityCI(cell) {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("CI-Signal Failing-tests"));

  for (i = 3; i <=30; i++) {
    cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
    var html = UrlFetchApp.fetch(cell).getContentText();
    var priorityregex = (/((priority\/[a-z]*-[a-z]*)|(priority\/[a-z]*))/);
    var priority = priorityregex.exec(html);
    SpreadsheetApp.getActiveSheet().getRange('G' + i).setValue(priority);
  }
}



    var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("CI-Signal Flakes"));
    for (i = 3; i <=30; i++) {
      cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
      if (Boolean(cell)){
        var html = UrlFetchApp.fetch(cell).getContentText();
        var statusregex = (/((Closed)|(Open))/);
        var status = statusregex.exec(html);
        SpreadsheetApp.getActiveSheet().getRange('B' + i).setValue(status);
  }else{
    break;
    }}


    var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("CI-Signal Failing-tests"));
    for (i = 3; i <=30; i++) {
      cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
      if (Boolean(cell)){
        var html = UrlFetchApp.fetch(cell).getContentText();
        var statusregex = (/((Closed)|(Open))/);
        var status = statusregex.exec(html);
        SpreadsheetApp.getActiveSheet().getRange('B' + i).setValue(status);
  }else{
    break;
    }}


function getStatusIssues(cell) {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));

    for (i = 3; i <=30; i++) {
      cell = SpreadsheetApp.getActiveSheet().getRange('A' + i).getValue()
      var html = UrlFetchApp.fetch(cell).getContentText();
      var statusregex = (/((Closed)|(Open))/);
      var status = statusregex.exec(html);
      SpreadsheetApp.getActiveSheet().getRange('B' + i).setValue(status);
  }
}


function movevalues(cell){

  var active = SpreadsheetApp.getActiveSpreadsheet();
//  active.setActiveSheet(active.getSheetByName("Bug Triage Issues"));

  var ac = active.getSheets()[0];

  for (i = 3; i <= 27; i++) {

  var urlrange = ac.getRange(i, 1);
  var urlvalues = urlrange.getValues();
  var jesuschrist = i + 27
  ac.getRange(jesuschrist, 1).setValue(urlvalues);
  }
}


*/
