// Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/seed.js
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { US, CA, slugify } from '../src/lib/regions.js';
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
// flags: F free, S showers, C security cameras, W wifi, D diesel, X not 24/7
// SAMPLE DATA: names, coordinates and spaces are approximate. Verify before relying on them.
const R = [
['Iowa 80 Truckstop','IA','Walcott','I-80','284',41.5981,-90.7746,900,'FSCWD'],
['Little America Travel Center','WY','Little America','I-80','68',41.5305,-109.466,300,'FSCWD'],
["Love's Travel Stop",'NE','Grand Island','I-80','312',40.9264,-98.342,200,'FSCWD'],
['TA Travel Center','NV','Elko','I-80','301',40.8324,-115.7631,180,'FSCWD'],
['Flying J Travel Center','NV','Sparks','I-80','21',39.5349,-119.7527,220,'FSCWD'],
['Pilot Travel Center','NC','Smithfield','I-95','95',35.5085,-78.3394,150,'FSCWD'],
["Love's Travel Stop",'SC','Florence','I-95','164',34.1954,-79.7626,140,'FSCD'],
['Petro Stopping Center','FL','Jacksonville','I-95','351',30.3322,-81.6557,170,'FSCWD'],
['TA Travel Center','NJ','Carneys Point','I-295','2',39.7126,-75.4669,120,'SCWD'],
["Love's Travel Stop",'TX','Amarillo','I-40','74',35.1991,-101.928,210,'FSCWD'],
['TA Travel Center','NM','Albuquerque','I-40','153',35.0844,-106.6504,190,'FSCWD'],
['Flying J Travel Center','OK','Oklahoma City','I-40','140',35.4676,-97.5164,200,'FSCWD'],
['Pilot Travel Center','TN','Memphis','I-40','1',35.1495,-90.049,160,'FSCWD'],
['Petro Stopping Center','AZ','Flagstaff','I-40','201',35.1983,-111.6513,130,'FSCWD'],
["Love's Travel Stop",'TX','Houston','I-10','770',29.7604,-95.3698,240,'FSCWD'],
['Pilot Travel Center','AZ','Tucson','I-10','268',32.2226,-110.9747,180,'FSCWD'],
['TA Travel Center','LA','Lake Charles','I-10','25',30.2266,-93.2174,150,'FSCWD'],
["Love's Travel Stop",'AZ','Tolleson','I-10','133',33.4506,-112.2596,200,'FSCWD'],
["Love's Travel Stop",'TX','Dallas','I-35','430',32.7767,-96.797,230,'FSCWD'],
['Pilot Travel Center','TX','San Antonio','I-35','160',29.4241,-98.4936,190,'FSCWD'],
['Flying J Travel Center','MO','Kansas City','I-35','8',39.0997,-94.5786,170,'FSCWD'],
['TA Travel Center','TX','Laredo','I-35','13',27.5306,-99.4803,260,'SCWD'],
['Husky Truck Stop','ON','Mississauga','ON-401','350',43.589,-79.6441,90,'SCWD'],
['Flying J Travel Plaza','ON','Cambridge','ON-401','282',43.3616,-80.3144,110,'SCWD'],
['Pioneer Truck Stop','ON','London','ON-401','186',42.9849,-81.2453,100,'SCWD'],
['Petro-Canada Truck Stop','ON','Kingston','ON-401','617',44.2312,-76.486,80,'SCD'],
['Husky Travel Centre','AB','Calgary','AB-2','261',51.0447,-114.0719,120,'SCWD'],
['Flying J Travel Plaza','AB','Red Deer','AB-2','401',52.2681,-113.8112,100,'SCWD'],
['Kamloops Truck Stop','BC','Kamloops','BC-1','368',50.6745,-120.3273,90,'SCD'],
['Abbotsford Truck Plaza','BC','Abbotsford','BC-1','90',49.0504,-122.3045,85,'SCWD'],
];
const rows = R.map(([name, st, city, hwy, exit, lat, lng, n, fl], i) => {
  const country = CA[st] ? 'CA' : 'US', stateName = (CA[st] || US[st]);
  return { id: `seed-${i + 1}`, slug: slugify(`${name} ${city} ${st}`), name, country, st, stateName, city, hwy, exit, lat, lng, n, fl, feat: i === 0 ? 1 : 0 };
});
await client.executeMultiple(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
await client.batch(rows.map((r) => ({
  sql: `INSERT OR IGNORE INTO stops (id,slug,name,country,state_province,state_name,city,highway,exit_number,latitude,longitude,total_spaces,is_free,has_showers,has_security,has_wifi,has_diesel,is_24_7,is_featured,featured_tagline) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  args: [r.id, r.slug, r.name, r.country, r.st, r.stateName, r.city, r.hwy, r.exit, r.lat, r.lng, r.n, +r.fl.includes('F'), +r.fl.includes('S'), +r.fl.includes('C'), +r.fl.includes('W'), +r.fl.includes('D'), +!r.fl.includes('X'), r.feat, r.feat ? 'Largest truck lot on I-80' : null],
})), 'write');
console.log(`Seeded ${rows.length} stops.`);
