
function ImageObject(name, fileN, target) {
    if (target == null) {
        target = false;
    }
    this.name = name;
    this.fileName = fileN;
    this.target = target;
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
