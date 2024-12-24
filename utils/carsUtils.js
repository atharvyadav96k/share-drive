const Car = require('../modules/carSchema');
const Request = require('../modules/requestCarSchema');
const User = require('../modules/userSchema');
const { requestEmail } = require('../utils/email');
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const stream = require('stream');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const sharp = require('sharp');

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
})

const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};
// saving image to cloud bucket
async function saveImageToBucket(file, resizedImage) {
    try {
        const uniqueName = `${uuidv4()}`;
        const params = {
            Bucket: bucketName,
            Key: uniqueName,
            Body: resizedImage,
            ContentType: file.mimetype,
        }
        const command = new PutObjectCommand(params);
        await s3.send(command)
        console.log(process.env.DOMAIN);
        const imageUrl = `/car/preview/${uniqueName}`;
        return imageUrl;
    } catch (error) {
        throw new Error('Failed to save image locally: ' + error.message);
    }
}

// sending thumbnail to client
exports.getPreviewImage = async (req, res) => {
    const { key } = req.params;
    try {   
        const getObjectParams = {
            Bucket: bucketName,
            Key: key
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 30 });
        res.redirect(url);
    } catch (err) {
        res.status(500).send('Failed to fetch image' + err.message);
    }
}

// adding  new car
exports.storeCarDetails = async (req, res) => {
    try {
        const {
            name,
            mileage,
            transmission,
            seats,
            fuel,
            pricePerDay,
            airConditioning,
            luggage,
            music,
            seatBelt,
            bluetooth,
            audioInput,
            longTermTrips,
            carKit,
            remoteCentralLocking,
            climateControl,
            frontSensors,
            backCamera,
        } = req.body;

        const imageBuffer = req.file.buffer;
        const thumbnailBuffer = await reduceImageSize(imageBuffer);
        
        // const storeImage = await saveImageToBucket(req.file, thumbnailBuffer);
        const car = new Car({
            name,
            mileage,
            transmission,
            seats,
            fuel,
            pricePerDay,
            features: {
                airConditioning: airConditioning === 'on',
                frontSensors: frontSensors === 'on',
                backCamera: backCamera === 'on',
                luggage: luggage === 'on',
                music: music === 'on',
                seatBelt: seatBelt === 'on',
                bluetooth: bluetooth === 'on',
                audioInput: audioInput === 'on',
                longTermTrips: longTermTrips === 'on',
                carKit: carKit === 'on',
                remoteCentralLocking: remoteCentralLocking === 'on',
                climateControl: climateControl === 'on',
            },
        });

        if (req.file) {
            // Ensure uploads directory exists
            const uploadDir = path.join(__dirname, '../public/uploads');
            ensureDirectoryExists(uploadDir);

            // Define file paths for image and thumbnail
            const imageName = `image-${Date.now()}-${req.file.originalname}`;
            const imagePath = path.join(uploadDir, imageName);

            const thumbnailName = `thumb-${Date.now()}-${req.file.originalname}`;
            const thumbnailPath = path.join(uploadDir, thumbnailName);

            // Save original image
            fs.writeFileSync(imagePath, req.file.buffer);

            // Create and save thumbnail
            const thumbnailBuffer = await reduceImageSize(req.file.buffer);
            fs.writeFileSync(thumbnailPath, thumbnailBuffer);

            // Update car with file paths
            car.image = `/uploads/${imageName}`;
            car.thumbnail = `/uploads/${thumbnailName}`;
            car.path = `/uploads/${thumbnailName}`
        }

        await car.save();
        res.redirect(`/admin/cars`);
    } catch (error) {
        console.error(error);
        res.status(500).json('Failed to save car details.' + error);
    }
};

// update car
exports.updateCarDetails = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        mileage,
        transmission,
        seats,
        fuel,
        pricePerDay,
        airConditioning,
        luggage,
        music,
        seatBelt,
        bluetooth,
        audioInput,
        longTermTrips,
        carKit,
        remoteCentralLocking,
        climateControl,
        frontSensors,
        backCamera,
    } = req.body;

    try {
        let car = await Car.findById(id);
        
        car.name = name || car.name;
        car.mileage = mileage || car.mileage;
        car.transmission = transmission || car.transmission;
        car.seats = seats || car.seats;
        car.fuel = fuel || car.fuel;
        car.pricePerDay = pricePerDay || car.pricePerDay;
        car.features = {
            airConditioning: airConditioning == 'on' ?? car.features.airConditioning,
            luggage: luggage == 'on' ?? car.features.luggage,
            music: music == 'on' ?? car.features.music,
            seatBelt: seatBelt == 'on' ?? car.features.seatBelt,
            bluetooth: bluetooth == 'on' ?? car.features.bluetooth,
            audioInput: audioInput == 'on' ?? car.features.audioInput,
            longTermTrips: longTermTrips == 'on' ?? car.features.longTermTrips,
            carKit: carKit == 'on' ?? car.features.carKit,
            remoteCentralLocking: remoteCentralLocking == 'on' ?? car.features.remoteCentralLocking,
            climateControl: climateControl == 'on' ?? car.features.climateControl,
            frontSensors: frontSensors == 'on' ?? car.features.frontSensors,
            backCamera: backCamera == 'on' ?? car.features.backCamera,
        };
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
       if (req.file) {
            // Ensure uploads directory exists
            const uploadDir = path.join(__dirname, '../public/uploads');
            ensureDirectoryExists(uploadDir);

            // Define file paths for image and thumbnail
            const imageName = `image-${Date.now()}-${req.file.originalname}`;
            const imagePath = path.join(uploadDir, imageName);

            const thumbnailName = `thumb-${Date.now()}-${req.file.originalname}`;
            const thumbnailPath = path.join(uploadDir, thumbnailName);
    

            // Save original image
            fs.writeFileSync(imagePath, req.file.buffer);

            // Create and save thumbnail
            const thumbnailBuffer = await reduceImageSize(req.file.buffer);
            fs.writeFileSync(thumbnailPath, thumbnailBuffer);

            // Update car with file paths
            car.image = `/uploads/${imageName}`;
            car.thumbnail = `/uploads/${thumbnailName}`;
            car.path = `/uploads/${thumbnailName}`;
        }
        await car.save();

        res.redirect(`/admin/cars`)
    } catch (err) {
        res.status(500).json({ message: "Error updating car details", error: err.message });
    }
};

// delete car
exports.deleteCar = async (req, res) => {
    const { id } = req.params;
    // console.log(id)
    try {
        const car = await Car.findOneAndDelete({ _id: id });
        res.redirect("/admin/cars")
    } catch (err) {
        res.send("err : " + err.message)
    }
}

// reduce size of image 
const reduceImageSize = async (imageBuffer) => {
    try {
        let resizedImageBuffer = await sharp(imageBuffer)
            .png({ quality: 80 })
            .toBuffer();
        while (resizedImageBuffer.length > 200 * 1024) {
            const quality = Math.max(50, 80 - 10);
            resizedImageBuffer = await sharp(resizedImageBuffer)
                .png({ quality: quality })
                .toBuffer();
        }

        return resizedImageBuffer;
    } catch (error) {
        throw new Error('Failed to reduce image size: ' + error.message);
    }
};

// display car details for admin 
exports.displayCar = async (req, res) => {
    try {
        const { id } = req.params;
        const car = await Car.findOne({ _id: id });
        if (!car) res.redirect('/car')
        // console.log(car);
        res.render('admin/car-single', { car });
    } catch (err) {
        console.log(err.message);
        res.status(500).send("server error");
    }
};

// get all requests 
exports.getRequests = async (req, res) => {
    try {
        let requests = await Request.find().populate({
            path: 'car',
            select: 'name pricePerDay'
        });
        console.log(requests)
        requests = requests.reverse();
        res.render('admin/getRequest', { requests });
    } catch (err) {
        res.status(500).send("Something went wrong")
    }
}

// display details of cars
exports.requestCar = async (req, res) => {
    if (!req.user_email) return res.redirect('/login#login')
    if (!req.user_verified) return res.redirect('/verification')
    const { id } = req.params;
    const name = req.user_name;
    const email = req.user_email;
    const phoneNo = req.user_phoneNo;
    try {
        const car = await Car.findOne({ _id: id }).select("name pricePerDay thumbnail image _id");
        return res.render('cars/requestCar', { car, name, email, phoneNo, userId: req.user_id });
    } catch (err) {
        return res.status(500).send("Bad Request");
    }
}

// sending request to get car
exports.acceptRequestCar = async (req, res) => {
    if (!req.user_email) return res.redirect('/login#login')
    if (!req.user_verified) return res.redirect('/verification');
    const userId = req.user_id;
    const email = req.user_email;
    const { name, phoneNo, carId } = req.body;
    try {
        const user = await User.findOne({ _id: userId });
        const car = await Car.findOne({ _id: carId });
        if (!user || !car) return res.status(404).send("Invalid gateway");
        const requestCar = new Request({
            car: carId,
            name,
            email,
            phoneNo
        });
        user.carRequest.push(requestCar._id);
        await user.save();
        await requestCar.save();
        await requestEmail(email, car.name, car.pricePerDay, name, user.phoneNo)
        return res.render('cars/requestSuccess')
    } catch (err) {
        return res.status(500).send("error : " + err.message);
    }
}
// display all cars
exports.getCars = async (req, res) => {
    try {
        const cars = await Car.find().select('name thumbnail pricePerDay _id');
        return res.render('cars/car', { cars, verified: req.user_verified, username: req.user_name, profile: req.user_id });
    } catch (err) {
        return res.status(500).send("<h1 style=`text-align: center;`> Something went wring </h1>");
    }
}

// cancel car
exports.cancelCarRequest = async (req, res)=>{
    const {id} = req.params;
    try{
        const request = await Request.findOne({_id: id});
        if(!request) return res.status(404).send("404 not found");
        request.status = 'cancel';
        await request.save();
        return res.redirect('/admin/requests');
    }catch(err){
        return res.status(500).send("Error: "+ err.message);
    }
}
// accept car
exports.acceptCar = async (req, res)=>{
    const {id} = req.params;
    try{
        const request = await Request.findOne({_id: id});
        if(!request) return res.status(404).send("404 not found");
        request.status = 'approve';
        await request.save();
        return res.redirect('/admin/requests');
    }catch(err){
        return res.status(500).send("Error :"+err.message);
    }
}

exports.pendingCarRequest = async (req, res)=>{
    const {id} = req.params;
    try{
        const request = await Request.findOne({_id: id});
        if(!request) return res.status(404).send("404 not found");
        request.status = 'pending';
        await request.save();
        return res.redirect('/admin/requests');
    }catch(err){
        return res.status(500).send("Error :"+err.message);
    }
}