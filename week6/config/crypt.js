module.exports = {
	saltRounds: process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10,
}
