const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const logsSchema = new mongoose.Schema({
	siteName: {
		type: String,
		required: true,
		enum: ["alfa", "mtc"]
	},
	num: {
		type: String,
		required: true,
		maxlength: 30
	},
	pin: {
		type: String,
		required: true,
		maxlength: 30
	},
	result: {
        type: String,
        required: false,
        maxlength: 300
    },
    pending: {
        type: Boolean,
        required: false
    },
    success: {
        type: Boolean,
        required: false
    }
}, { timestamps: { createdAt: 'created_at' } });

const Logs = mongoose.model('Log', logsSchema);

const app = express();


app.use(cors());
app.use(express.json());


app.use(authMidleware);
app.post('/logs', async (req, res) => {
	const { siteName, num, pin, result, pending, success } = req.body;

	const newLog = new Logs({
		siteName,
		num,
		pin,
		result,
		pending, 
		success
	});

	try {
		await newLog.save();
		res.status(201).send('Log created successfully');
	} catch (err) {
		// console.error(err);
		res.status(500).send(`Internal server error ${err.message}`);
	}
});

app.get('/logs', async (req, res) => {
	try {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

		const logs = await Logs.find({
			created_at: { $gte: today, $lt: tomorrow }
		});

		res.json(logs);
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal server error');
	}
});

mongoose.connect(process.env.db)
.then(() => {
	console.log('Database connection successful');
	app.listen(3000, () => {
	console.log('your server is runnning');
});
})
.catch((err) => {
	console.error('Database connection error:', err);
});

function authMidleware (req, res, next) {
   const authHeader = req.headers['authorization']
   const pass = authHeader && authHeader.split(' ')[1] 
    
   if(pass !== process.env.API_PASS) {
	    return res.status(401).json({ msg: "Unauthorized. Please provide valid credentials in the 'Authorization' header using the format 'pass <password>'." });
   }
		 
    next()
}