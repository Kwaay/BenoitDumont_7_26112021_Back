const sequelize = require('./models/index')

// Auto-Purge des tokens expirés (24h)
async function autoPurge () {
    const datetime = new Date()
    datetime.setHours(datetime.getHours() - 23);
    // Test : datetime.setSeconds(datetime.getSeconds() - 20);
    let format = datetime.toISOString().replace('Z', '').replace('T', ' ').slice(0, 19);
    console.log(format);
    await sequelize.query(`DELETE FROM tokens WHERE createdAt < "${format}" `)
}
module.exports = {
    autoPurge
    
}