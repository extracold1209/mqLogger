import isNetworkConnected from "./isNetworkConnected";

describe('isNetworkConnected', function () {
    it('connection test', async function () {
        const result = await isNetworkConnected();

        if (result) {
            console.log('Network Connected');
        } else {
            console.log('Network Not Connected')
        }
    });
});
