/** A HANDWRITTEN package smoke fixture. Never returned by /api/generate. */
import { catalogId } from './catalogDefinition';

const loan = {'@path': '/loan'};
const totals = {'@call':'sum',args:{a:1000,b:loan}};
export const smokeMessages = [
  {version:'1.0',createSurface:{surfaceId:'smoke-balance-sheet',catalogId,sendDataModel:true}},
  {version:'1.0',updateDataModel:{surfaceId:'smoke-balance-sheet',path:'/',value:{loan:400}}},
  {version:'1.0',updateComponents:{surfaceId:'smoke-balance-sheet',components:[
    {id:'root',component:'Column',children:['title','chart','loan','formula']},
    {id:'title',component:'Text',variant:'heading',text:'What the business has = how it was paid for'},
    {id:'chart',component:'Chart',title:'A balance sheet on one scale',max:1800,min:0,unit:'$',groups:[
      {label:'Assets',segments:[{label:'Cash',value:400,tone:'cash'},{label:'Cart',value:600,tone:'neutral'},{label:'Equipment',value:loan,tone:'equipment'}]},
      {label:'Liabilities + equity',segments:[{label:'Owner’s equity',value:1000,tone:'royal'},{label:'Bank loan',value:loan,tone:'loan'}]}
    ]},
    {id:'loan',component:'NumberInput',label:'Bank loan',value:loan,min:0,max:800,step:100,unit:'$'},
    {id:'formula',component:'Formula',label:'Both sides total',expression:'$1,000 + bank loan',result:totals,unit:'$'}
  ]}},
];
