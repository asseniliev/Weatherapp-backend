var express = require('express');
var router = express.Router();

const City = require('../models/cities');

const OWM_API_KEY = process.env.OWM_API_KEY;

router.post('/', async (req, res) => {

	// Check if the city has not already been added
	const foundCity = await City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } });

	//If the city exists - we don't do anything
	if (foundCity !== null) {
		res.json({ result: false, error: 'City already saved' });
		return;
	}

	const apiData = await getCityWeather(req.body.cityName);

	//if city is found in the weather api data
	if (apiData.result) {

		const newCity = new City({
			cityName: apiData.cityWeather.cityName
		});
		await newCity.save();
	}

	res.json(apiData);
});

router.get('/', async (req, res) => {
	const cities = await City.find();

	const weatherData = [];
	for (const city of cities) {
		const cityWeather = await getCityWeather(city.cityName);
		weatherData.push(cityWeather);
	}
	res.json({ weather: weatherData });
});

router.get("/:cityName", async (req, res) => {

	const cityFound = await City.findOne({
		cityName: { $regex: new RegExp(req.params.cityName, "i") },
	});

	if (cityFound === null) {
		res.json({ result: false, error: "City not found" });
		return;
	}

	const weatherData = await getCityWeather(req.params.cityName);

	res.json({ weatherData });

});

router.delete("/:cityName", (req, res) => {
	City.deleteOne({
		cityName: { $regex: new RegExp(req.params.cityName, "i") },
	}).then(deletedDoc => {
		if (deletedDoc.deletedCount > 0) {
			// document successfully deleted
			City.find().then(data => {
				res.json({ result: true, weather: data });
			});
		} else {
			res.json({ result: false, error: "City not found" });
		}
	});
});


async function getCityWeather(cityName) {

	const apiData = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OWM_API_KEY}&units=metric`)).json();

	if (apiData.cod === "404") {
		return { result: false, error: 'City does not exist' };
	}

	cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
	const cityWeather = {
		cityName: cityName,
		main: apiData.weather[0].main,
		description: apiData.weather[0].description,
		tempMin: apiData.main.temp_min,
		tempMax: apiData.main.temp_max,
	}

	return { result: true, cityWeather: cityWeather };;
}

module.exports = router;
