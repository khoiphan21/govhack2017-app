import { Component, OnInit, HostBinding } from '@angular/core';
import { slideInDownAnimation } from '../animations';
// import the D3 service, the type alias for the d3 varialbe and selection interface
import { D3Service, D3, Selection } from 'd3-ng2-service';
import { Demographic } from '../classes/demographic';
import { DataService } from '../data.service';

@Component({
  selector: 'app-page-stats',
  templateUrl: './page-stats.component.html',
  styleUrls: ['./page-stats.component.scss'],
  animations: [slideInDownAnimation]
})
export class PageStatsComponent implements OnInit {
  @HostBinding('@slideInAnimation') routeAnimation = true;
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.position') position = 'absolute';
  private d3: D3;
  
  // Variables for the demographic data
  demographicData: Demographic;
  genZ: string;
  millenials: string;
  genX: string;
  babyBoomers: string;
  traditionalists: string;

  constructor(
    private d3Service: D3Service,
    private dataService: DataService
  ) { // passing d3 service into the consturctor
  }

  ngOnInit() {
    this.d3 = this.d3Service.getD3(); // <-- obtain the d3 object from the D3 service
    this.demographicData = this.dataService.getDemographicData('NUNDAH');
    this.demographicData.ageRange.genZ

    // SETUP THE DEMOGRAPHIC DATA
    let maxAgeRange = Math.max(
      this.demographicData.ageRange.genZ,
      this.demographicData.ageRange.millenials,
      this.demographicData.ageRange.genX,
      this.demographicData.ageRange.babyBoomers,
      this.demographicData.ageRange.traditionalists,
    );
    let ageRange = this.demographicData.ageRange;
    this.genZ = `${ageRange.genZ / maxAgeRange * 100}%`;
    this.millenials = `${ageRange.millenials / maxAgeRange * 100}%`;
    this.genX = `${ageRange.genX / maxAgeRange * 100}%`;
    this.babyBoomers = `${ageRange.babyBoomers / maxAgeRange * 100}%`;
    this.traditionalists = `${ageRange.traditionalists / maxAgeRange * 100}%`;

    // DRAW THE DONUT CHART
    let d3 = this.d3; // for convenience use a block scope variable
    let height,
      width,
      barWidth = 50,
      barOffset = 5,
      radius;
    // Setup params for the chart    
    let parentElement = document.getElementById('chart-wrapper');
    height = parentElement.getBoundingClientRect().height;
    width = parentElement.getBoundingClientRect().width;
    radius = Math.min(height, width) / 2;

    let pie = d3.pie()
      .value((d: number) => {return d;})
      .sort(null);

    let color = ["#C3A485", "#067376"];
    let demographicdata = [55, 45];

    // Create an arc generator with configuration
    let arc = d3.arc()
      .innerRadius(radius * 0.85)
      .outerRadius(radius);

    let svg = d3.select('svg.chart')
      .attr("width", width)
      .attr("height", height)
    .append('g')
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    let path = svg.selectAll('path')
      .data(pie(demographicdata))
      .enter().append('path')
      .attr('d', <any> arc)
      .attr('fill', (d, i) => {
        return color[i];
      });
    // END DONUT CHART
  }

}
