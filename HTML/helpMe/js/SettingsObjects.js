
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

function Level(family, targets, distracters, objects, sound) {
    this.targetFamily = family;
    this.numberOfTargets = targets;
    this.numberOfDistracters = distracters;
    this.sequenceOfObjects = objects;
    this.sound = sound;
}
