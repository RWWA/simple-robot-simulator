
var MoveRobot = {
    'initialize': function() {
        $('#command-form').submit(function(e){
            e.preventDefault();
            //TODO: sort a value like 1,1,north
            var commands = $(this).serializeArray()[0].value.toLowerCase().split(/,?\s+/);
            var command = commands.shift();
            if (command.length) { //check whether a command is specified
                if (command != 'place' && !MoveRobot.isRobotOnTable()){
                    MoveRobot.error('Please place robot on table first.');
                    return;
                }
                switch (command) {
                    case 'place':
                        if (commands.length == 3) {
                            MoveRobot.place(parseInt(commands[0]), parseInt(commands[1]), commands[2]);
                        }
                        else
                        {
                            MoveRobot.error("Insufficient arguemnts provided");
                        }
                        break;
                    case 'move':
                        MoveRobot.move();
                        break;
                    case 'left':
                        MoveRobot.rotateLeft();
                        break;
                    case 'right':
                        MoveRobot.rotateRight();
                        break;
                    case 'report':
                        MoveRobot.report();
                        break;
                }
            }

            MoveRobot.error("Invalid command");
        });
    },
    'isRobotOnTable': function(){
        var position = $('#robot').position();
        return MoveRobot.validMove(position.left, position.top);
    },
    'error': function(message){
        $('#error-message').html('<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+message+'</div>');
    },
    'testConversions': function (x,y){
        var absolute = MoveRobot.convertCoordinatesToAbsolute(x,y);
        var coordintes = MoveRobot.convertAbsoluteToCoordinates(absolute[0], absolute[1]);
        if (Math.round(coordintes[0]) == x && Math.round(coordintes[1]) == y) {
            alert('values match');
            return true;
        }

        alert('Values do not match ');
        return false;
    },
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

    'report': function () {
        var position = $('#robot').position();
        var coords = MoveRobot.convertAbsoluteToCoordinates(position.left, position.top);
        alert('Current Position is '+coords[0]+','+coords[1]+' '+$('#robot').attr('direction'));
    },

    'getAdjustedHeight': function(){
        return $('#table').height() - 36;
    },

    'getIndividualUnit': function(){
        return (MoveRobot.getAdjustedHeight() / 5);
    },

    'convertCoordinatesToAbsolute': function(x, y) {
        var table = $('#table');
        var position = table.position();

        //Assuming a standard of 5x5 units
        var individualUnit = MoveRobot.getIndividualUnit();
        var absX = Math.abs(individualUnit * x + position.left);
        var absY = Math.abs(individualUnit * y - (position.top + MoveRobot.getAdjustedHeight()));

        return [absX, absY];
    },
    'convertAbsoluteToCoordinates': function(x, y) {
        var position = $('#table').position();
        var individualUnit = MoveRobot.getIndividualUnit();
        var coordX = (x - position.left) / individualUnit;
        var coordY = Math.abs(y - position.top - MoveRobot.getAdjustedHeight()) / individualUnit;

        return [Math.round(coordX), Math.round(coordY)];
    },

    'move': function() {
        var robot = $('#robot');
        var currentPos = robot.position();
        //We don't have to convert to coordinates. We could just increment my 'individualUnit'
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