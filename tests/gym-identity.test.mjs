import test from 'node:test';
import assert from 'node:assert/strict';
import {gymIdentityMatches} from '../gym-identity.mjs';

const query={name:'Synthetic Fitness',location:'Sampleton, PA',address:'4102 E Example St, Sampleton, PA 15000'};
const candidate={name:'Synthetic Fitness Sampleton',city:'Sampleton, PA',address:query.address};
const matches=(queryChange={},candidateChange={})=>gymIdentityMatches({...query,...queryChange},{...candidate,...candidateChange});

test('common US address formatting and dotted initials match without editing inputs',()=>{
 const full={name:'Synthetic Fitness Sampleton',city:'Sampleton, Pennsylvania',address:'4102 East Example Street, Sampleton, Pennsylvania 15000-1234'},before=structuredClone(full);
 assert.equal(gymIdentityMatches(query,full),true);assert.deepEqual(full,before);
 assert.equal(matches({name:'SF Fitness'},{name:'S.F. Fitness'}),true);
 assert.equal(matches({name:'SF Fitness'},{name:'S.F Fitness'}),true);
 assert.equal(matches({name:'SF Fitness'},{name:'S.F.Fitness'}),true);
 for(const [abbreviation,name] of [['N','North'],['S','South'],['E','East'],['W','West'],['NE','Northeast'],['NW','Northwest'],['SE','Southeast'],['SW','Southwest']]){
  assert.equal(matches({address:`4102 ${abbreviation} Example St, Sampleton, PA 15000`},{address:`4102 ${name} Example Street, Sampleton, Pennsylvania 15000`}),true);
 }
 assert.equal(matches({address:'4102 Example St W, Sampleton, PA 15000'},{address:'4102 Example Street West, Sampleton, PA 15000'}),true);
 assert.equal(matches({address:'4102 W St Charles Ave, Sampleton, PA 15000'},{address:'4102 West St Charles Avenue, Sampleton, PA 15000'}),true);
 assert.equal(matches({address:'4102 Unit St, Sampleton, PA 15000'},{address:'4102 Unit Street, Sampleton, PA 15000'}),true);
});

test('ZIP extensions are optional on one side and exact when supplied on both sides',()=>{
 assert.equal(matches({}, {address:query.address+'-1234'}),true);
 assert.equal(matches({address:query.address+'-1234'}),true);
 assert.equal(matches({address:query.address+'-1234'},{address:query.address+'-1234'}),true);
 assert.equal(matches({address:query.address+'-1234'},{address:query.address+'-5678'}),false);
 assert.equal(matches({location:'Sampleton, PA 15000',address:query.address+'-1234'},{city:'Sampleton, PA 15000',address:query.address+'-5678'}),false);
 assert.equal(matches({}, {address:query.address.replace('15000','15001')}),false);
 assert.equal(matches({}, {address:query.address.replace(' 15000','')}),false);
});

test('city and state remain separate from street tokens with city-only candidate fields',()=>{
 assert.equal(matches({}, {city:'Sampleton',address:'4102 East Example Street, Sampleton, Pennsylvania 15000'}),true);
 assert.equal(matches({address:''}, {city:'Sampleton',address:'4102 East Example Street Sampleton Pennsylvania 15000'}),true);
 assert.equal(matches({location:'',address:'4102 E Example St, Sampleton, PA 15000'}),true);
 assert.equal(matches({address:''}, {city:'Elsewhere, PA',address:'4102 Sampleton St, Elsewhere, PA 15000'}),false);
 assert.equal(matches({address:''}, {city:'Sampleton, PA',address:'4102 Example Street Elsewhere PA 15000'}),false);
 assert.equal(matches({}, {city:'Elsewhere, PA',address:query.address.replace('Sampleton','Elsewhere')}),false);
 assert.equal(matches({}, {city:'Sampleton, OH',address:query.address.replace('PA','OH')}),false);
 assert.equal(matches({}, {city:'Sampleton, PA',address:query.address.replace('Sampleton','Elsewhere')}),false);
 assert.equal(matches({location:'St. Sampleton, PA',address:''},{city:'Saint Sampleton, PA',address:'4102 Example St, Saint Sampleton, PA 15000'}),false);
 assert.equal(matches({location:'New York',address:''},{city:'Albany, NY',address:'4102 Example Street, Albany, NY 12207'}),false);
 assert.equal(matches({location:'Washington',address:''},{city:'Spokane, WA',address:'4102 Example Street, Spokane, WA 99201'}),false);
 assert.equal(matches({location:'New York',address:''},{city:'New York',address:'4102 Example Street, New York, NY 10001'}),true);
});

test('different streets, directions, house numbers, units and named branches stay rejected',()=>{
 for(const candidateChange of [
  {address:query.address.replace('4102','4103')},
  {address:'999 E Example St, Suite 4102, Sampleton, PA 15000'},
  {address:query.address.replace(' E ',' W ')},
  {address:query.address.replace('Example','Other')},
  {address:query.address.replace(' St,',' Ave,')},
  {name:'Other Fitness Sampleton'},
  {name:'Synthetic Fitness Elsewhere',city:'Elsewhere, PA',address:query.address.replace('Sampleton','Elsewhere')}
 ])assert.equal(matches({},candidateChange),false);
 assert.equal(matches({name:'Synthetic Fitness Northside'},{name:'Synthetic Fitness Southside'}),false);
 assert.equal(matches({name:'Synthetic Fitness Southside'},{name:'Synthetic Fitness South Side'}),false);
 assert.equal(matches({name:'Synthetic Fitness North'},{name:'Synthetic Fitness'}),false);
 assert.equal(matches({address:'4102 E Example St, Suite 4, Sampleton, PA 15000'},{address:'4102 East Example Street, Ste 4, Sampleton, PA 15000'}),true);
 assert.equal(matches({address:'4102 E Example St, Suite 4, Sampleton, PA 15000'},{address:'4102 East Example Street, Suite 5, Sampleton, PA 15000'}),false);
 assert.equal(matches({address:'4102 E Example St, Suite 4, Sampleton, PA 15000'}),false);
 assert.equal(matches({address:'12-34 E Example St, Sampleton, PA 15000'},{address:'12 34 E Example St, Sampleton, PA 15000'}),false);
});

test('existing comma, suite and uncommaed address forms remain supported',()=>{
 const suiteQuery={name:'Synthetic Fitness Pleasant Grove',location:'Pleasant Grove, PA',address:'601 Example Blvd, Suite 38, Pleasant Grove, PA 15000'};
 assert.equal(gymIdentityMatches(suiteQuery,{name:suiteQuery.name,city:suiteQuery.location,address:suiteQuery.address}),true);
 const simple={name:'Synthetic Fitness',location:'Cleveland OH',address:''};
 assert.equal(gymIdentityMatches(simple,{name:'Synthetic Fitness Cleveland',city:'Cleveland OH',address:'123 Example Street, Cleveland OH 44101'}),true);
 assert.equal(gymIdentityMatches({...simple,address:'123 Example St Cleveland OH 44101'},{name:'Synthetic Fitness Cleveland',city:'Cleveland',address:'123 Example Street, Cleveland, Ohio 44101'}),true);
});

test('unknown formats require literal identity and missing or malformed fields fail closed',()=>{
 const unusual={name:'Synthetic Fitness',location:'Sampleton, PA',address:'One Example Arcade, Sampleton, PA 15000'};
 assert.equal(gymIdentityMatches(unusual,{name:unusual.name,city:unusual.location,address:unusual.address}),true);
 assert.equal(gymIdentityMatches(unusual,{name:unusual.name,city:unusual.location,address:unusual.address.replace('Arcade','Arc')}),false);
 assert.equal(matches({location:'Sampleton, ZZ'}),false);
 for(const invalid of [null,{}, {...query,name:''},{...query,location:'',address:''},{...query,address:12},{...query,location:{city:'Sampleton'}}])assert.equal(gymIdentityMatches(invalid,candidate),false);
 for(const invalid of [null,{}, {...candidate,name:''},{...candidate,city:12},{...candidate,address:''}])assert.equal(gymIdentityMatches(query,invalid),false);
});
