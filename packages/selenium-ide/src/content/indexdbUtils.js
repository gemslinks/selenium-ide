/* eslint no-unused-vars: off, no-useless-escape: off */
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


const DB_STATUS = 'DB_STATUS';

export function isTransactionFinish(param) {
  let dbStatus = getDbStatus();
  window.localStorage.removeItem(DB_STATUS);
  if( dbStatus != null ){
    if(dbStatus.type == "error"){
      throw new Error(dbStatus.message);
    }else{
      return true;
    }
  }else{
    return false;
  }
}

export function setDbStatus(event){
  //console.log(event);
  let dbStatus = {
     type : "done"
    ,message : ""
  };

  if( event.type == "error" ){
    dbStatus.type = "error";
    dbStatus.message = "execute database failed:" 
    + "[Error="+ event.target.error + "]"
    + "[data=" + JSON.stringify(event.target.error.data) + "]";
  }
  window.localStorage.setItem(DB_STATUS, JSON.stringify(dbStatus) );
}

export function getDbStatus(){
  let event = window.localStorage.getItem(DB_STATUS);
  if( event == null){
    return null;
  }else{
    return JSON.parse(event);
  }
}


/*
{
   "command" : "deleteDB"
  ,"dbName"  : "stockDB"
}
*/
export function deleteDB(dbDef){
  // Request a transaction with readwrite
  var req = window.indexedDB.deleteDatabase(dbDef.dbName);
  req.onsuccess = function (event) {
    //console.log("deleteDB success")
    setDbStatus(event);
  };
  req.onerror = function (event) {
    //console.log("deleteDB error")
    setDbStatus(event);
  };
}

/*
{
   "command" : "createDB"
  ,"dbName"  : "stockDB"
  ,"tables"  : [{"name":"m_contries", "uks":["sys_uk01"], "indexs":["name"]}, {"name":"t_stocks", "uks":["sys_uk01"], "indexs":["stockId", "stockName"]}]
}
*/
export function createDB(dbDef){
  let req = window.indexedDB.open(dbDef.dbName, 1);
  req.onupgradeneeded = function(event){
    let targetData = null;
    //table create
    for(let table of dbDef.tables){
      targetData = table;
      let objectStore = event.target.result.createObjectStore(table.name, {keyPath: "sys_pk", autoIncrement:true});
      //uk create
      for(let uk of table.uks){
        targetData = uk;
        objectStore.createIndex(uk, uk, { unique: true });
      }      
      //index create
      for(let index of table.indexs){
        targetData = index;
        objectStore.createIndex(index, index, { unique: false });
      }
    }
  }
  req.onsuccess = function(event) {
    //console.log("createDB success")
    setDbStatus(event);
  };    
  req.onerror = function(event){
    event.target.error.data = targetData;
    //console.log("createDB error")
    setDbStatus(event);
  }
}

 /**
  {
     "command" : "connectDB"
    ,"dbName"  : "stockDB"
  }
  */
 export function connectDB(dbDef, resolve, reject){
  return new Promise((resolve, reject) => {
    let req = window.indexedDB.open(dbDef.dbName, 1);
    req.onsuccess = function(event){
      dbDef.dbCon = event.target.result;
      //console.log("connectDB success")
      resolve();
    }    
    req.onerror = function(event){
      //console.log("connectDB error")
      reject(event);
    }
  });
}

/*
{
  "command" : "insert"
  ,"dbName"  : "stockDB"
  ,"table"   : "m_contries"
  ,"datas"   : [{"id":"01", "name":"japan"}, {"id":"02", "name":"usa"}]
}
*/
export function insertRD(dbDef, varName, resolve, reject){
  return new Promise((resolve, reject) => {
    // Request a transaction with readwrite
    let resultCount = 0;
    var trx = dbDef.dbCon.transaction([dbDef.table], "readwrite");
    trx.oncomplete = function(event) {
      setDbStatus(event);
      browser.runtime.sendMessage({ storeStr: resultCount, storeVar: varName });
      //console.log("insertRD oncomplete")
      resolve();
    };
    trx.onerror = function(event){
      debugger
      setDbStatus(event);
      //console.log("insertRD onerror")
      reject(event);
    }

    let table = trx.objectStore([dbDef.table]);
    let targetData = null;
    
    dbDef.datas.map(data => {
      //error時にセットするため
      targetData = data;
      //tableにdataを追加
      let req = table.add(data)
      resultCount++;
      req.onsuccess = function(event) {
        //console.log("insertRD add onsuccess")
      };
      req.onerror = function(e) {
        //エラーデータを保存
        //console.log("insertRD add onerror")
        e.target.error.data = targetData;
      };      
    });
  });
};

 /**
  {
     "command" : "select"
    ,"dbName"  : "stockDB"
    ,"table"   : "m_contries"
    ,"where"   : "value.id == '01'"
    ,"varName" : "countries" 
  }
  varNameはJSON.parse()でobjectに戻せる
  ※connectDB
  */
 export function selectRD(dbDef, varName, resolve, reject){
  return new Promise((resolve, reject) => {
    let trx = dbDef.dbCon.transaction([dbDef.table], "readonly");
    trx.oncomplete = function(event) {
      setDbStatus(event);
      //console.log("selectRD oncomplete")
      resolve();
    }
    trx.onerror = function(event){
      debugger
      setDbStatus(event);
      //console.log("selectRD onerror")
      reject(event);
    }

    let table = trx.objectStore([dbDef.table]);
    let req = table.openCursor()
    let results = [];
    req.onsuccess = function(event){
      let cursor = event.target.result;
      if(cursor) {
        //console.log(cursor.value)
        //eval用value
        let value = cursor.value;
        if(dbDef.where == null || eval(dbDef.where)){
          results.push(value)
        }
        cursor.continue();
      }else{
        //console.log("selectRD onsuccess")
        browser.runtime.sendMessage({ storeStr: results, storeVar: varName })
      }
    }
    req.onerror = function(event){
      //console.log("selectRD onerror")
      reject(event);
    }
  });
}

 /**
  {
     "command" : "update"
    ,"dbName"  : "stockDB"
    ,"table"   : "m_contries"
    ,"set"     : "value.name = '変更1';  value.name = '変更2'; "
    ,"where"   : "value.id == '01'"
    ,"varName" : "resultCount" 
  }
  
  ※connectDB
  */
 export function updateRD(dbDef, varName, resolve, reject){
  return new Promise((resolve, reject) => {
    let trx = dbDef.dbCon.transaction([dbDef.table], "readwrite");
    trx.oncomplete = function(event) {
      setDbStatus(event);
      //console.log("updateRD oncomplete")
      resolve();
    };
    trx.onerror = function(event){
      debugger
      setDbStatus(event);
      //console.log("updateRD onerror")
      reject(event);
    }

    let table = trx.objectStore([dbDef.table]);
    let reqSel = table.openCursor()
    let resultCount = 0;
    //where句のdefault expression
    if(dbDef.where == null) dbDef.where = true
    reqSel.onsuccess = function(event){
      let cursor = event.target.result;
      if(cursor) {
        //console.log(cursor.value)
        //eval用value
        let value = cursor.value;
        //絞り込み
        if(eval(dbDef.where)){
          //更新
          eval(dbDef.set);
          let reqUpd = cursor.update(value)
          resultCount++
          reqUpd.onsuccess = function(event) {
            //console.log("updateRD reqUpd onsuccess")
          };
          reqUpd.onerror = function(event) {
            //console.log("updateRD reqUpd onerror")
            event.target.error.data = cursor.value;
          };           
        }
        cursor.continue();
      }else{
        browser.runtime.sendMessage({ storeStr: resultCount, storeVar: varName })
      }
    }
    reqSel.onerror = function(event){
      //console.log("updateRD reqSel onerror")
      reject(event);
    }
  });
}

 /**
  {
     "command" : "delete"
    ,"dbName"  : "stockDB"
    ,"table"   : "m_contries"
    ,"where"   : "value.id == '01'"
    ,"varName" : "resultCount" 
  }
  
  ※connectDB
  */
 export function deleteRD(dbDef, varName, resolve, reject){
  return new Promise((resolve, reject) => {
    let trx = dbDef.dbCon.transaction([dbDef.table], "readwrite");
    trx.oncomplete = function(event) {
      setDbStatus(event);
      //console.log("deleteRD oncomplete")
      resolve();
    };
    trx.onerror = function(event){
      debugger
      setDbStatus(event);
      //console.log("deleteRD onerror")
      reject(event);
    }

    let table = trx.objectStore([dbDef.table]);
    let reqSel = table.openCursor()
    let resultCount = 0;
    //where句のdefault expression
    if(dbDef.where == null) dbDef.where = true
    reqSel.onsuccess = function(event){
      let cursor = event.target.result;
      if(cursor) {
        //console.log(cursor.value)
        let value = cursor.value;
        //絞り込み
        if(eval(dbDef.where)){
          //削除
          let reqUpd = cursor.delete(value)
          resultCount++
          reqUpd.onsuccess = function(event) {
            //console.log("deleteRD reqUpd onsuccess")
          };
          reqUpd.onerror = function(event) {
            //console.log("deleteRD reqUpd onerror")
            event.target.error.data = cursor.value;
          };           
        }
        cursor.continue();
      }else{
        browser.runtime.sendMessage({ storeStr: resultCount, storeVar: varName })
      }
    }
    reqSel.onerror = function(event){
      //console.log("deleteRD reqSel onerror")
      reject(event);
    }
  });
}
