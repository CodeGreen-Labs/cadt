import {sequelize} from "../models/database.js";
import {Project} from "../models/index.js";

import xlsx from 'node-xlsx';
import stream from "stream";

export const sendXls = (name, bytes, response) => {
  const readStream = new stream.PassThrough();
  readStream.end(bytes);
  
  response.set('Content-disposition', 'attachment; filename=' + name + '.xls');
  response.set('Content-Type', 'text/plain');
  
  readStream.pipe(response);
}

export const createXlsFromSequelizeResults = (rows, model) => {
  rows = JSON.parse(JSON.stringify(rows)); // Sadly this is the best way to simplify sequelize's return shape
  
  let columnsInResults = [];
  
  if (rows.length) {
    // All rows look the same.. grab the first result to determine xls schema
    columnsInResults = Object.keys(rows[0]);
  }
  
  let associations = model.getAssociatedModels();
  const columnsInMainSheet = columnsInResults.filter(col => !associations.map(a => a.name + 's').includes(col));
  const associatedModels = columnsInResults.filter(col => associations.map(a => a.name + 's').includes(col));
  
  const initialReduceValue = {}
  initialReduceValue[model.name] = { name: model.name + 's', data: [columnsInMainSheet] }
  
  const xlsData = rows.reduce((sheets, row) => {
    let mainXlsRow = [];
  
    // Populate main sheet values
    for (const [mainColName, mainCol] of columnsInMainSheet.entries()) {
      if (!Object.keys(sheets).includes(model.name)) {
        sheets[model.name] = { name: model.name + 's', data: [model.defaultColumns] }; // Column headings
      }
      
      if (!associations.map(singular => singular + 's').includes(mainColName)) {
        mainXlsRow.push(row[mainCol]);
      }
      
    }
  
    if (mainXlsRow.length) {
      sheets[model.name].data.push(mainXlsRow);
    }
    
    
    // Populate associated data sheets
    for (const associatedModel of associatedModels) {
      const xlsRow = [];
      // Column headings for associated sheets will be available for associated sheets once its referenced by a row
      if (!Object.keys(sheets).includes(associatedModel) && row[associatedModel + 's'].length > 0) {
        sheets[associatedModel] = {
          name: associatedModel,
          data: [
            columnsInResults.filter(col => !Object.keys(columnsInMainSheet).includes(col))
          ],
        };
      }
      
      for (const [columnName, columnValue] of Object.entries(row)) {
        if (!columnsInMainSheet.includes(columnName) && columnValue) {
          if (Array.isArray(columnValue)) {
            // one to many
            for (const [_assocIndex, assocColVal] of columnValue.entries()) {
              Object.values(assocColVal).map(col => xlsRow.push());
            }
          } else {
            // one to one
            xlsRow.push(columnValue);
          }
        }
        if (xlsRow.length > 0) {
          sheets[associatedModel].data = sheets[associatedModel].data.concat(xlsRow);
        }
      }
    }
    
    return sheets;
  }, initialReduceValue);
  
  return xlsx.build(Object.values(xlsData));
}

