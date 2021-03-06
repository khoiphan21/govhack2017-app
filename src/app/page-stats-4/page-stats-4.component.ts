import { Component, OnInit, HostBinding } from '@angular/core';
import { slideInRightAnimation } from '../animations';
declare var google: any;
import * as _ from 'underscore';

import { Demographic } from '../classes/demographic';
import { DataService } from '../data.service';
import { CountryOfBirth } from '../classes/countryOfBirth';
import { PointOfInterest } from '../classes/pointOfInterest';
import { PublicFacilities } from '../classes/publicFacilities';
import { ModalService } from '../modal.service';
import { D3Service, D3 } from 'd3-ng2-service';

@Component({
  selector: 'app-page-stats-4',
  templateUrl: './page-stats-4.component.html',
  styleUrls: ['./page-stats-4.component.scss'],
  animations: [slideInRightAnimation]
})
export class PageStats4Component implements OnInit {
  @HostBinding('@slideInRightAnimation') routeAnimation = true;
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.position') position = 'absolute';

  // Variables for the points of interests
  pointOfInterest: PointOfInterest;

  // Variables for public facilities
  publicFacilities: PublicFacilities;

  // Variables for the demographic data
  demographicData: Demographic;
  genZ: string;
  millenials: string;
  genX: string;
  babyBoomers: string;
  traditionalists: string;
  malePercentage: number;
  femalePercentage: number;
  totalPopulation: number;
  averageDisposableIncome: number;
  familyHouseholds: number;

  // Variables for ethnicities
  ethnicities: string[] = []; // Country names
  ethnicityValues: string[] = []; // go straight to style.width for the bar
  ethnicBarColors: string[] = [
    '#728780', 
    '#95D6BE',
    '#F3AB70',
    '#C2CFBD',
    '#CE3E77',
  ]; // index must match the index of the countries

    d3: D3;

  constructor(private dataService: DataService,
  private modalService: ModalService,
    private d3Service: D3Service) { }

  ngOnInit() {
    // Retrieve D3
    this.d3 = this.d3Service.getD3();

    var clayfield = { lat: -27.4180, lng: 153.0570 };

    var map = new google.maps.Map(document.getElementById('top-map'), {
      zoom: 14,
      center: clayfield
    });

    var markerMain = new google.maps.Marker({
      position: clayfield,
      map: map,
      title: 'Clayfield',
    });
    this.demographicData = this.dataService.getDemographicData('CLAYFIELD');
    this.pointOfInterest = this.dataService.getPOI('CLAYFIELD');
    this.publicFacilities = this.dataService.getPublicFacilities('CLAYFIELD');

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
    // General stuff
    this.malePercentage = Math.round(this.demographicData.male / this.demographicData.totalPopulation * 100);
    this.femalePercentage = Math.round(this.demographicData.female / this.demographicData.totalPopulation * 100);
    this.totalPopulation = this.demographicData.totalPopulation;
    this.averageDisposableIncome = this.demographicData.averageDisposableIncome;
    this.familyHouseholds = this.demographicData.familyHouseholds;

    // SETUP THE ETHNICITIES DATA
    let countriesOfBirth: number[] = [];
    let maxPeople: number = 0;
    _.each(this.demographicData.countryOfBirth, (country: CountryOfBirth) => {
      countriesOfBirth.push(country.amount);
      this.ethnicities.push(country.country);
      // Get the max number of people
      if (country.amount > maxPeople) {
        maxPeople = country.amount;
      }
    })
    // Now calculate the length of the bar
    _.each(countriesOfBirth, value => {
      this.ethnicityValues.push(`${value / maxPeople * 100}%`)
    })
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
    let demographicdata = [
      this.demographicData.male, this.demographicData.female
    ];

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

  showModal() {
    this.modalService.showModal();
  }
}

