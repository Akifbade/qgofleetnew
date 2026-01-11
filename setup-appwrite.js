
/**
 * APPWRITE BACKEND SETUP SCRIPT (CargoTrack V3 - Force Permissions)
 * 
 * 1. npm install node-appwrite
 * 2. node setup-appwrite.js
 */

const { Client, Databases, Storage, ID, Permission, Role } = require('node-appwrite');

// === CONFIGURATION ===
const APPWRITE_ENDPOINT = 'https://track.qgocargo.cloud/v1';
const APPWRITE_PROJECT_ID = '696340ef001ad9708f45'; 
const APPWRITE_API_KEY = 'standard_39f53d8968163f555b91d7a0e02e656bc09866fa5ed2910820dfa01f91628aa451c918ac005d80ff403b20f7a1110df5c44aff4536fd9f9a2e5533ef3c1731b8b8dac0e06a2a9d11af246bf730787ff6e3744992a402382cba8a3b242256af1616b7d1b540ef460acf178263af6f8b3d504307957a3275a40eca224b55738a79';

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = 'main';
const BUCKET_ID = 'signatures';

const ALL_PERMISSIONS = [
    Permission.read(Role.any()),
    Permission.create(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.any()),
];

async function setup() {
    console.log('🚀 Starting CargoTrack Backend Setup (V3 - Force Sync)...');

    try {
        // 1. Database
        try {
            await databases.create(DATABASE_ID, 'CargoTrack Database');
            console.log('✅ Database "main" created.');
        } catch (e) { console.log('ℹ️ Database "main" exists.'); }

        // 2. Bucket
        try {
            await storage.createBucket(BUCKET_ID, 'Signatures', ALL_PERMISSIONS, false);
            console.log('✅ Bucket "signatures" created.');
        } catch (e) { 
            console.log('ℹ️ Updating Bucket "signatures" permissions...');
            try {
                await storage.updateBucket(BUCKET_ID, 'Signatures', ALL_PERMISSIONS, false);
                console.log('✅ Bucket permissions updated.');
            } catch (ue) { console.log('⚠️ Failed to update bucket:', ue.message); }
        }

        // 3. Collections and Attributes
        const collections = [
            {
                id: 'profiles',
                name: 'User Profiles',
                attributes: [
                    { name: 'name', type: 'string', size: 100, required: true },
                    { name: 'email', type: 'string', size: 100, required: true },
                    { name: 'role', type: 'string', size: 20, required: true },
                    { name: 'isOnline', type: 'boolean', required: false, default: false },
                    { name: 'dutyStart', type: 'string', size: 10, required: false, default: '08:00' },
                    { name: 'dutyEnd', type: 'string', size: 10, required: false, default: '17:00' },
                    { name: 'batteryLevel', type: 'integer', required: false },
                    { name: 'signalStrength', type: 'string', size: 50, required: false },
                    { name: 'currentLat', type: 'float', required: false },
                    { name: 'currentLng', type: 'float', required: false },
                    { name: 'lastUpdated', type: 'string', size: 50, required: false }
                ],
                indexes: [
                    { key: 'idx_role', type: 'key', attributes: ['role'] }
                ]
            },
            {
                id: 'pods',
                name: 'POD Entries',
                attributes: [
                    { name: 'awbNumber', type: 'string', size: 50, required: true },
                    { name: 'moveType', type: 'string', size: 20, required: true },
                    { name: 'pieces', type: 'integer', required: true },
                    { name: 'weight', type: 'float', required: true },
                    { name: 'origin', type: 'string', size: 500, required: true },
                    { name: 'destination', type: 'string', size: 500, required: true },
                    { name: 'description', type: 'string', size: 1000, required: false },
                    { name: 'driverId', type: 'string', size: 50, required: true },
                    { name: 'driverName', type: 'string', size: 100, required: true },
                    { name: 'status', type: 'string', size: 20, required: true },
                    { name: 'recipientName', type: 'string', size: 100, required: false },
                    { name: 'signatureUrl', type: 'string', size: 1000, required: false },
                    { name: 'createdAt', type: 'string', size: 50, required: true },
                    { name: 'deliveredAt', type: 'string', size: 50, required: false }
                ],
                indexes: [
                    { key: 'idx_driver', type: 'key', attributes: ['driverId'] },
                    { key: 'idx_created', type: 'key', attributes: ['createdAt'] }
                ]
            },
            {
                id: 'location_history',
                name: 'Location History',
                attributes: [
                    { name: 'driverId', type: 'string', size: 50, required: true },
                    { name: 'lat', type: 'float', required: true },
                    { name: 'lng', type: 'float', required: true },
                    { name: 'timestamp', type: 'string', size: 50, required: true }
                ],
                indexes: [
                    { key: 'idx_driver_hist', type: 'key', attributes: ['driverId'] },
                    { key: 'idx_time', type: 'key', attributes: ['timestamp'] }
                ]
            }
        ];

        for (const col of collections) {
            console.log(`📦 Setting up collection: ${col.id}...`);
            try {
                await databases.createCollection(DATABASE_ID, col.id, col.name, ALL_PERMISSIONS);
                console.log(`  - Collection created.`);
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) { 
                console.log(`  - Updating existing collection permissions...`); 
                try {
                    await databases.updateCollection(DATABASE_ID, col.id, col.name, ALL_PERMISSIONS);
                } catch (ue) { console.log('⚠️ Permission update failed:', ue.message); }
            }

            for (const attr of col.attributes) {
                try {
                    if (attr.type === 'string') await databases.createStringAttribute(DATABASE_ID, col.id, attr.name, attr.size, attr.required, attr.default);
                    else if (attr.type === 'integer') await databases.createIntegerAttribute(DATABASE_ID, col.id, attr.name, attr.required);
                    else if (attr.type === 'float') await databases.createFloatAttribute(DATABASE_ID, col.id, attr.name, attr.required);
                    else if (attr.type === 'boolean') await databases.createBooleanAttribute(DATABASE_ID, col.id, attr.name, attr.required, attr.default);
                    process.stdout.write(`.`);
                    await new Promise(r => setTimeout(r, 600)); 
                } catch (ae) {}
            }
            console.log(`\n  - Attributes synced.`);

            // Setup Indexes
            if (col.indexes) {
                for (const idx of col.indexes) {
                    try {
                        await databases.createIndex(DATABASE_ID, col.id, idx.key, idx.type, idx.attributes);
                        console.log(`  - Created index: ${idx.key}`);
                        await new Promise(r => setTimeout(r, 1000));
                    } catch (ie) { console.log(`  - Index ${idx.key} exists.`); }
                }
            }
        }

        console.log('\n✨ SETUP COMPLETE!');
        console.log('IMPORTANT: Go to Appwrite Console -> Project Settings -> Platforms and ensure you have added your current hostname to the Web platform list.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setup();
