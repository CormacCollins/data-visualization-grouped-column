    
    // ----------------------------------------------------------------------------------------------------------------------//
    //
    //                                      GROUPED-BAR-CHART VISUALIZATION
    //
    // ----------------------------------------------------------------------------------------------------------------------//


    var subjectDescr = ["DEF - defence", "ECOAFF - economic affairs", "EDU - education", "ENVPROT - environmental protection", "GRALPUBSER - general public services",
                        "HEATLH - heatlth", "HOUCOMM - housing and community amenities", 
                        "PUBORD - public order and safety", "RECUTREL - recreation, culture and religion", "SOCPROT - social protection"];


    // ------------------------------------------------------
    // GLOBAL LISTS
    // ------------------------------------------------------
    var selectedCountries = ["FRA", "HUN", "IRL", "OAVG"];
    var selectableCountries = [];
    var selectableYears = [];
    var selectedYearToDispay = [2014];
    var dataGlobal = [];
    var svg;

    // ------------------------------------------------------
    // JQUERY scroll screen on action
    // ------------------------------------------------------
    $("#lineChartDiv").click(function() {
    $('html,body').animate({
        scrollTop: $("#lineChart").offset().top},
        'slow');
    });



    // ---------------------------------------------------
    // Populate select drop downs with array list 
    // --------------------------------------------------
    function populateSelect(listArray, panelName){     
        var sel = document.getElementsByClassName(panelName);
        [].forEach.call(sel, function(d){
            for(var i = 0; i < listArray.length; i++) {
                var opt = document.createElement('option');
                opt.innerHTML = listArray[i];
                opt.value = listArray[i];
                d.appendChild(opt);
            }   
        });             
    }


    // ---------------------------------------------------
    // Get selected values from drop downs
    // --------------------------------------------------
    function getSelectedValues(panelName, selectedList){ 
        var sel = document.getElementsByClassName(panelName);
        [].forEach.call(sel, function(d){
            var selectedValue = d.options[d.selectedIndex].value;
            if(selectedValue) {
                console.log(selectedValue);
                selectedList.push(selectedValue);
            }
        });             
    }


    // ---------------------------------------------------
    // Setup button event
    // ----------------------------------------------------
    document.getElementById("populate").addEventListener("click", function(event) {
        selectedCountries = [];
        selectedYearToDispay = [];
        console.log("event fired");
        getSelectedValues("select-panel", selectedCountries);     
        getSelectedValues("select-panel-year", selectedYearToDispay);
        console.log(selectedCountries);
        console.log(selectedYearToDispay);
        svg.selectAll("*").remove();
        setupChart(dataGlobal);
    });

    // --------------------------------------------------------
    // Load Data and store in global data variable
    // --------------------------------------------------------
    d3.csv("data/spending.csv", function(d, i, columns) {
        selectableCountries.push(d.LOCATION);
        selectableYears.push(d.TIME);

        return d;
        }, function(error, data){
            if (error) throw error;

            dataGlobal = data;
            setupChart(data);
    });
    
    // --------------------------------------------------
    // Full chart setup - D3
    // --------------------------------------------------
    function setupChart(data) {

        svg = d3.select("svg"),
        margin = {top: 20, right: 80, bottom: 30, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1);

        var x1 = d3.scaleBand()
            .padding(0.05);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

        var z = d3.scaleOrdinal()
        .range(d3.schemeCategory20);

        //setup select dropdowns
        selectableCountries = remove_duplicates_es6(selectableCountries);
        selectableYears = remove_duplicates_es6(selectableYears);
        populateSelect(selectableCountries, "select-panel");
        populateSelect(selectableYears, "select-panel-year");

        //parse data for only countries selected
        data = parseDataByCountry(data);

        fullYearData = data;
        //parse data for only year values 
        data = getYearVals(data, selectedYearToDispay[0]);


        //get subject fields for columns, sort them and remove duplicates
        var result = [];
        data.filter(function(d){
            result.push(d["SUBJECT"]);
        });
        result.sort();
        result = remove_duplicates_es6(result);

        //add to keys (simply for naming convention)
        var keys = result;      



        //map scale to number / amount of subject
        x0.domain(keys.map(function(d, i) { 
                return d; }
            ));

        //map second x scale to the countries selected
        x1.domain(selectedCountries).rangeRound([0, x0.bandwidth()]);

        //map y axis to max value in data
        y.domain([0, d3.max(data, function(d) { 
            return d3.max(keys, function(key) { 
                        return d.Value; 
            });})]).nice();

        g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d) { return "translate(" + x0(d.LOCATION) + "," + height + ")"; })
            .selectAll("rect")
            .data(data)
            .enter().append("rect")
            .attr("class", function (d) {
                return d.SUBJECT;
            })
            .attr("x", function(d) { 
                return x0(d.SUBJECT) + x1(d.LOCATION); })
            .attr("y", function(d) { 
                return y(d.Value); 
                })
            .attr("width", x0.bandwidth()/selectedCountries.length)
            .attr("height", function(d) {
                    return height - y(+d.Value);
            })
            .attr("fill", function(d) { 
                return z(d.LOCATION); 
            })
            //To transition to linechart
            .on("click", function(d){
                $("#lineChartDiv").trigger("click");
                line(fullYearData, selectedCountries, d.SUBJECT, width, height, z);
            });

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Spending");

        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(selectedCountries.slice())            
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width + 40)
            .attr("width", 20)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width + 35)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });
    }

    // -------------------------------------------
    // Check that given coutry ia in selectedList 
    // -------------------------------------------
    function IsSelectedCountry(country){
        var result = selectedCountries.filter(function(c){
            if(c == country){
                return true;
            }
        });
        return result == country;
    }


    // -------------------------------------
    //use set to remove duplicates
    //http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
    // -------------------------------------
    function remove_duplicates_es6(arr) {
        let s = new Set(arr);
        let it = s.values();
        return Array.from(it);
    }

    // ------------------------------------
    // Get Data spcific to countries chosen
    // ------------------------------------
    function parseDataByCountry(data){

        console.log(data);

        var obj = [];

        for(var j = 0; j < data.length; j++)
        {
            if(IsSelectedCountry(data[j]["LOCATION"])){
            
                //consturct and add that new object          
                var newObj = {};
                newObj["LOCATION"] = data[j]["LOCATION"];
                newObj["SUBJECT"] = data[j]["SUBJECT"];
                newObj["Value"] = +data[j]["Value"];
                newObj["TIME"] = +data[j]["TIME"]   ;             
                obj.push(newObj);
            }
        }

        console.log(obj);

        return obj;
    }


    // ------------------------------------
    // Get Data by year chosen
    // ------------------------------------
    function getYearVals(data, time){
        var returnData = [];

        //return correct year
        var getYear = function(d, time){
            if(time == d.TIME){
                return d;
            }};

        for(var i = 0; i < data.length; i++){
        var g = getYear((data[i]), time);
        if(g){
            //console.log(g);
            returnData.push(g);
        }
        }
        console.log(returnData);

        return returnData;
    }

    // ----------------------------
    // Hex conversion functions 
    // ---------------------------

    function hexToRgbNew(hex) {
        var arrBuff = new ArrayBuffer(4);
        var vw = new DataView(arrBuff);
        vw.setUint32(0,parseInt(hex, 16),false);
        var arrByte = new Uint8Array(arrBuff);

        return arrByte[1] + "," + arrByte[2] + "," + arrByte[3];
    }

    // -------------------------------------------------------------------------------------------
    // ----------------------------- LINE CHART FUNCTION CALL ------------------------------------
    // -------------------------------------------------------------------------------------------

    function line(data, selectedCountries, subject, width, height, colourScale){
        var newData = [];

        console.log(selectedCountries);      

        var countryObject = {};
        for(var j = 0; j < selectedCountries.length; j++){
            var newData = [];
            for(var g = 0; g < data.length; g++){                
                var newObj = {};
                if(subject == data[g].SUBJECT && selectedCountries[j] == data[g].LOCATION){
                    newObj['TIME'] = data[g].TIME;
                    newObj['Value'] = data[g].Value;
                    newData.push(newObj);
                }
            }
            countryObject[selectedCountries[j]] = newData;

        }

    LineChart(countryObject[selectedCountries[0]], countryObject, colourScale);

}
