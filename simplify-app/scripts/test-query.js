const https = require('https');
const KEY = '78fd3f6c3d92cb3416a4605ab957e6c2dab62f7483ba8a89a7b8b31dfdc70b6efe18a523eff06dceeff136c9d2706e5cee0c2fd69e92a5c1f8fd158af2f511aac76391414a54134350f70057d69efdca1ad7bd958c933d8e08e27f315c867730a8e8c0c75799b53b5e5e626176498e349a84199a86eaa114422ea85d7978ecce';

function get(path) {
  return new Promise(res => {
    const r = https.request({hostname:'appwrite.geladisalam.my.id',path,headers:{'X-Appwrite-Project':'simplify-library-3','X-Appwrite-Key':KEY}}, rs=>{let d='';rs.on('data',c=>d+=c);rs.on('end',()=>res({s:rs.statusCode,b:d.slice(0,300)}));});
    r.on('error',e=>res({error:e.message}));r.end();
  });
}

const enc = encodeURIComponent;
async function main() {
  const formats = [
    enc('Query.limit(5)'),
    enc('Limit(5)'),
    enc(JSON.stringify({method:'limit',values:[5]})),
    enc(JSON.stringify({method:'equal',attribute:'status',values:['published']})),
  ];
  for (const f of formats) {
    const r = await get('/v1/databases/simplify-db/collections/books/documents?queries[]=' + f);
    console.log(f.slice(0,40), '->', r.s, r.b.slice(0,100));
  }
}
main();
