var exec = require("child_process").exec;

//Get app root path. 
var path = require("path");
var rootPath = path.dirname(require.main.filename);
var appPath = 0;

var package = require(rootPath + "/package.json");

//Get .app path.
if (rootPath.indexOf(".app") != -1)
{
    var appPath = /\/.*\.app/.exec(rootPath)[0];
}

module.exports.on = function(callback)
{
    if (!appPath)  return;
    
    if (process.platform=="darwin")
    {

        var applescript = 'tell application "System Events" to make login item at end with properties {path:"' + appPath + '", name:"' + package.name + '", hidden:false}';
        
        runAppleScript(applescript, function()
        {
            typeof callback === "function" && callback();
        })
    }
}

module.exports.off = function(callback)
{
    if (process.platform=="darwin")
    {
        var applescript = 'tell application "System Events" to delete login item "' + package.name + '"';
        
        runAppleScript(applescript, function()
        {
            typeof callback === "function" && callback();
        })
    }
}

module.exports.enabled = function(callback)
{
    if (process.platform=="darwin")
    {
        var applescript = 'tell application "System Events" to get the name of every login item';
        runAppleScript(applescript, function(items)
        {
            //The AppleScript outputs a list with commas and a space, this turns that into an array.
            var list = items.split(/,\s\n?/g);
            var found = 0;
            
            //Could use indexOf but the last item in the array contains a newline.
            for (var i in list)
            {
                if (list[i].trim() == package.name)
                {
                    found = 1;
                }
            }
            
            callback(found);
        })
    }
}

function runAppleScript(applescript, callback)
{
    var script = "osascript -e '" + applescript + "'";
    exec(script, function(error, stdout, stderr) 
    {
        callback(stdout);
    });
    
}