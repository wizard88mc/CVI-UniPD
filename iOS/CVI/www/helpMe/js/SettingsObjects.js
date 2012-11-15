
function ImageObject(name, fileN, id, target) {
    if (target == null) {
        target = false;
    }
    this.name = name;
    this.fileName = fileN;
    this.target = target;
    this.imageID = id;
    this.image = new Image();
    this.image.src = 'images/' + fileN;
    this.image.onload = utilsNamespace.anotherImageRetrieved;
}

function Level(type, numberOfTargets, numberOfDistracters, targetFamily, sequence, sound, 
		soundBagComplete, soundObjectNotInserted, maxTimeImage) {
	this.type = type;
    this.numberOfTargets = numberOfTargets;
    this.numberOfDistracters = numberOfDistracters;
    this.targetFamily = targetFamily;
    this.sequence = sequence;
    this.sound = sound;
    this.soundBagComplete = soundBagComplete;
    this.soundObjectNotInserted = soundObjectNotInserted;
    this.maxTimeImage = maxTimeImage;
}

function ImageLevel(isTarget, imageID) {
	this.isTarget = isTarget;
	this.imageID = imageID;
}
