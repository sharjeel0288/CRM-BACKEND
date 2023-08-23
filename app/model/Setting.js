const connection = require('../../config/DbConfig');

class Setting {
    static async getSetting() {

        try {
            const selectQuery = 'SELECT * FROM setting WHERE id = 1';
            const [settingRows, _] = await connection.query(selectQuery);

            if (settingRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Settings not found' });
            }

            const settings = settingRows[0];
            return settings
        } catch (error) {
            console.error('Get settings error:', error);
            throw error;
        }
    }


}
module.exports = Setting;
