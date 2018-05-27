
var MoveRobot = {
    'initialize': function() {
        $('#command-form').submit(function(e){
            e.preventDefault();
            //TODO: sort a value like 1,1,north
            var commands = $(this).serializeArray()[0].value.toLowerCase().split(/\b\s*,?\s*/);
            var command = commands.shift();
            if (command.length) { //check whether a command is specified
                //Check to confirm no other command is executed before the robot is on the table
                if (command != 'place' && !MoveRobot.isRobotOnTable()){
                    MoveRobot.error('Please place robot on table first.');
                    return;
                }
                //Main command switch
                switch (command) {
                    case 'place':
                        if (commands.length == 3) {
                            MoveRobot.place(parseInt(commands[0]), parseInt(commands[1]), commands[2]);
                        }
                        else
                        {
                            MoveRobot.error("Insufficient arguemnts provided");
                        }
                        return;
                    case 'move':
                        MoveRobot.move();
                        return;
                    case 'left':
                        MoveRobot.rotateLeft();
                        return;
                    case 'right':
                        MoveRobot.rotateRight();
                        return;
                    case 'report':
                        MoveRobot.report();
                        return;
                }
            }

            MoveRobot.error("Invalid command");
        });
    },
    //Convience function to return check if the robot is on the table
    'isRobotOnTable': function(){
        var position = $('#robot').position();
        return MoveRobot.validMove(position.left, position.top);
    },
    //Generic error handling/display function
    'error': function(message){
        //Uses bootstrap alerts
        $('#error-message').html('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+message+'</div>');
    },
    //Test funtion to confirm convertCoordinatesToAbsolute and convertAbsoluteToCoordinates are working correctly
    'testConversions': function (x,y){
        var absolute = MoveRobot.convertCoordinatesToAbsolute(x,y);
        var coordintes = MoveRobot.convertAbsoluteToCoordinates(absolute[0], absolute[1]);
        //Since the coordinates are mathematically calculated we need to round them up
        if (Math.round(coordintes[0]) == x && Math.round(coordintes[1]) == y) {
            alert('values match');
            return true;
        }

        alert('Values do not match ');
        return false;
    },
    //Validate whether the position provided falls withing the boundaries of the table
    'validMove': function(x, y) {
        var table = $('#table');
        var position = table.position();
        var height = MoveRobot.getAdjustedHeight();

        if(x >= position.left && x <= position.left + height && y >= position.top && y <= position.top + height + 36) {
            return true;
        }

        return false;
    },                
    'validDirection': function (direction) {
        switch(direction.toLowerCase()){
            case 'north':
            case 'south':
            case 'east':
            case 'west':
                return true;
            default:
                return false;
        }
    },
    //Rotate robot left and store direction
    'rotateLeft': function(){
        //Other ways we could do this is :
        // -> use CSS 'rotate' to visually show the change in direction, we still need to store it for move
        // -> store direction in a publicly accessible variable
        var currentDirection = $('#robot').attr('direction');
        var newDirection = "";
        switch(currentDirection) {
            case 'north':
                newDirection = 'west';
                break;
            case 'west':
                newDirection = 'south';
                break;
            case 'south':
                newDirection = 'east';
                break;
            case 'east':
                newDirection = 'north';
                break;
            default:
                MoveRobot.error('Invalid direction provided');
                return;
        }
        MoveRobot.setDirection(newDirection);
    },
    //Rotate robot right and store direction
    'rotateRight': function(){
        //Other ways we could do this is :
        // -> use CSS 'rotate' to visually show the change in direction, we still need to store it for move
        // -> store direction in a publicly accessible variable
        var currentDirection = $('#robot').attr('direction');
        var newDirection = "";
        switch(currentDirection) {
            case 'north':
                newDirection = 'east';
                break;
            case 'west':
                newDirection = 'north';
                break;
            case 'south':
                newDirection = 'west';
                break;
            case 'east':
                newDirection = 'south';
                break;
            default:
                MoveRobot.error('Invalid direction provided');
                return;
        }

        MoveRobot.setDirection(newDirection);
    },
    //Report handling function
    'report': function () {
        var position = $('#robot').position();
        var coords = MoveRobot.convertAbsoluteToCoordinates(position.left, position.top);
        alert('Current Position is '+coords[0]+','+coords[1]+' '+$('#robot').attr('direction'));
    },
    //The height of the table is adjusted to accomodate the image dimensions
    'getAdjustedHeight': function(){
        return $('#table').height() - 36;
    },
    //Get each individual step
    'getIndividualUnit': function(){
        return (MoveRobot.getAdjustedHeight() / 5);
    },
    //Converts coordinates in the form of 0,1 to actual position values
    'convertCoordinatesToAbsolute': function(x, y) {
        var table = $('#table');
        var position = table.position();

        //Assuming a standard of 5x5 units
        var individualUnit = MoveRobot.getIndividualUnit();
        //Since .position() gives us the top left corner of an element we need to do some math to get the 0,0
        // position which according to this task is the south west most corner
        var absX = Math.abs(individualUnit * x + position.left);
        var absY = Math.abs(individualUnit * y - (position.top + MoveRobot.getAdjustedHeight()));

        return [absX, absY];
    },
    //Converts absolute position to coordinates: Does inverse of above
    'convertAbsoluteToCoordinates': function(x, y) {
        var position = $('#table').position();
        var individualUnit = MoveRobot.getIndividualUnit();
        var coordX = (x - position.left) / individualUnit;
        var coordY = Math.abs(y - position.top - MoveRobot.getAdjustedHeight()) / individualUnit;

        return [Math.round(coordX), Math.round(coordY)];
    },
    //Move the robot one step in the direction previously stored
    'move': function() {
        var robot = $('#robot');
        var currentPos = robot.position();
        //We don't have to convert to coordinates. We could just increment by 'individualUnit'
        var coordinates = MoveRobot.convertAbsoluteToCoordinates(currentPos.left, currentPos.top);
        var coordX = coordinates[0];
        var coordY = coordinates[1];
        var direction = robot.attr('direction');
        if (MoveRobot.validDirection(direction)) {
            switch(direction.toLowerCase()) {
                case 'north':
                    coordY++;
                    break;
                case 'south':
                    coordY--;
                case 'west':
                    coordX--;
                    break;
                case 'east':
                    coordX++;
                    break;
            }

            MoveRobot.place(coordX, coordY, direction);
        }
    },
    //Place robot in the position provided and store the direction in it's attrib
    'place': function(x, y, direction) {
        var convertedUnits = MoveRobot.convertCoordinatesToAbsolute(x, y);
        if(MoveRobot.validMove(convertedUnits[0], convertedUnits[1]) && MoveRobot.validDirection(direction)) {
            MoveRobot.moveRobot(convertedUnits[0], convertedUnits[1]);
            MoveRobot.setDirection(direction);
        }
        else {
            MoveRobot.error("Invalid move");
        }
    },
    'moveRobot': function(x,y){
        $('#robot').css({left: x, top: y});
    },
    'setDirection': function(direction){
        $('#robot').attr('direction', direction);
    }
    
};

$(document).ready(function(){
    MoveRobot.initialize()
});