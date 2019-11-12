function drawChart() {
    const svgWidth = 1300, svgHeight = 800;
    const margin = { top: 20, right: 175, bottom: 200, left: 50 };
    const marginTop = 75;
    const marginYLabel = 25;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select('svg')
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // title 
    svg.append("text")
        .attr("transform", `translate(${margin.left - 30}, ${margin.top})`)
        .attr("x", 10).attr("y", 10)
        .attr("class", "title")
        .text("Ukraine Population Prospects");

    // label y Axis 
    svg.append("text")
        .attr("transform", `translate(${margin.left - 30}, ${margin.top + marginYLabel})`)
        .attr("x", 10).attr("y", 10)
        .attr("class", "subTitle")
        .text("Total population, million");

     // estimate
    svg.append("text")
       .attr("transform", `translate(205, 85)`)
       .attr("class", "population-estimate")
       .text("estimate");

     // projection 
    svg.append("text")
        .attr("transform", `translate(590, 85)`)
        .attr("class", "population-projection")
        .text("projection");

    // label x Axis 
    svg.append("text")
        .attr("transform", `translate(1000, 750)`)
        .attr("class", "xLabel")
        .text("Data: UN World Population Prospects");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top + marginTop})`) 
        
    // xScale
    const x = d3.scaleLinear()
        .range([0, width])

    // yScale
    const y = d3.scaleLinear()
        .rangeRound([height, 0]);

    const types = [
        'estimate',
        'medium variant',
        'high variant',
        'low variant',
        'constant fertility',
        'instant replacement',
        'momentum',
        'zero migration',
        'constant mortality',
        'no change'
    ];

    // const axis = svg.append("g").classed("axis", true);
    const dataFile = "population_prospects.csv";

    d3.csv(dataFile).then(function(data) {
        console.log(JSON.stringify(data))
            let dataLabel = [];

            // data is now whole data set
            // draw chart in here!
            for (let type of types) {

                const dataType = data.filter(item => item.type === type).map(item => ({ ...item, year: parseInt(item.year) }));

                const line = d3.line()
                    .x(function(d) { return x(d.year)})
                    .y(function(d) { return y(d.population)})

                y.domain([d3.min(data, function(d) { return d.population }), d3.max(data, function(d) { return d.population })]);
                x.domain([d3.min(data, function(d) { return d.year }), d3.max(data, function(d) { return d.year })]);

                g.append("path")
                    .datum(dataType)
                    .attr('class', type === "estimate" ? "solid" : "dashed")
                    .attr("fill", "none")
                    .attr("stroke", type === "estimate" ? "steelblue" : "red")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 1.5)
                    .attr("d", line)

                if (type !== "estimate") {
                    dataLabel.push({type, y: y(dataType.slice(-1)[0].population)});                        
                }
            }

            const sortedDataLabel = dataLabel.sort((a, b) => (a.y > b.y) ? 1 : ((b.y > a.y) ? -1 : 0))
        
            let needLineHeight = true;

            // mic coordinates y for label
            while (needLineHeight) {
                needLineHeight = false;

                for (let i = 1; i < sortedDataLabel.length; i++) {  
                    if (sortedDataLabel[i].y - sortedDataLabel[i - 1].y < 15) {
                        needLineHeight = true;
                        
                        sortedDataLabel[i - 1].y = sortedDataLabel[i - 1].y - 1;
                        sortedDataLabel[i].y = sortedDataLabel[i].y + 1;
                    }
                }
            } 

            for (let i = 0; i < sortedDataLabel.length; i++) {
                let item = sortedDataLabel[i];
                
                // create lables for each lines
                svg.append("text")
                    .attr("class", "label")
                    .attr("transform", `translate(${width + margin.left + 10}, ${item.y + marginTop + 17})`)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .style("fill", (/variant/.test(item.type)) ? "red" : 'black')
                    .text(item.type);
            }
        
            const axisFormatter = d3.format("d"); 

            g.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y).tickFormat(function(d) { return axisFormatter(d / 1000); }))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("font-size", "13px")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end");

            const xAxis_woy = d3.axisBottom(x)
                .ticks(4)
                .tickValues([1950, 1991, 2020, 2100])
                .tickFormat(axisFormatter);

            // add the X gridlines
            svg.append("g")			
                .attr("class", "grid")
                .attr("font-size", "13px")
                .attr("transform", `translate(${margin.left + 0.5}, ${height + margin.top + marginTop})`)
                .call(make_x_gridlines()
                    .tickSize(-height - 20)
                    .tickValues([1950, 1991, 2020, 2100])
                    .tickFormat("")
                )

            // add the Y gridlines
            svg.append("g")			
                .attr("class", "grid")
                .attr("transform", `translate(${margin.left + 0.5}, ${margin.top + marginTop})`)
                .call(make_y_gridlines()
                    .tickSize(-width - 10)
                    .tickFormat("")
                )

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(${margin.left}, ${height + margin.top + marginTop})`)
                .call(xAxis_woy)
        })
        .catch(function(error){
            console.log('error:', error);
            // handle error   
        })

    // gridlines in x axis function
    function make_x_gridlines() {		
        return d3.axisBottom(x)
            .ticks(4)
    }

    // gridlines in y axis function
    function make_y_gridlines() {	
        return d3.axisLeft(y)
            .ticks(8)
    }
}

// run
drawChart();

