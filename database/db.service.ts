import database from './database'

const dbService = {
    authenticateDB() {
        return database.authenticate()
    },
    // dropDB = () => database.drop();

    syncDB() {
        return database.sync().then((res: any) => {
            console.log('[****   Database Sync Done...!!!   ***]');
        }).catch((error: any) => {
            console.log(error);
        })
    },

    async successfulDBStart() {
        console.info('connection to the database has been established successfully')
    },

    async errorDBStart(err: any) {
        console.info('unable to connect to the database:', err);
        console.log('Error staring the server. Database connection not established')
    },

    async startMigrateTrue() {
        try {
            await this.syncDB();
            this.successfulDBStart();
        } catch (err) {
            this.errorDBStart(err);
        }
    },

    async startProd() {
        try {
            await this.authenticateDB();
            await this.startMigrateTrue();
        } catch (err) {
            this.errorDBStart(err);
        }
    },

    async start() {
        await this.startProd();
    },


};

export default dbService;
