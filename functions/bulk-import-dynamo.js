var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var csv_filename = "YOUR_CSV_FILENAME_WITH_ABSOLUTE_PATH";

rs = fs.createReadStream(csv_filename);
parser = parse({
    columns : true,
    delimiter : ','
}, function(err, data) {

    var split_arrays = [], size = 25;

    while (data.length > 0) {
        split_arrays.push(data.splice(0, size));
    }
    data_imported = false;
    chunk_no = 1;

    async.each(split_arrays, function(item_data, callback) {
        ddb.batchWriteItem({
            "TABLE_NAME" : item_data
        }, {}, function(err, res, cap) {
            console.log('done going next');
            if (err == null) {
                console.log('Success chunk #' + chunk_no);
                data_imported = true;
            } else {
                console.log(err);
                console.log('Fail chunk #' + chunk_no);
                data_imported = false;
            }
            chunk_no++;
            callback();
        });

    }, function() {
        // run after loops
        console.log('all data imported....');

    });

});
rs.pipe(parser);