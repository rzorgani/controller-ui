import { Component, OnInit, OnChanges, AfterContentInit, ViewChild,
    EventEmitter, ElementRef, Input, Output, HostListener } from '@angular/core';

@Component({
  selector: 'cui-classic-regulator-handle',
  templateUrl: './classic-regulator-handle.component.html',
  styleUrls: ['./classic-regulator-handle.component.css']
})
export class ClassicRegulatorHandleComponent implements OnInit, OnChanges, AfterContentInit {

    private _value = 0;

    @ViewChild('ctrlTractionCtn') ctrlTractionCtn: ElementRef;
    @Input()steps?;
    @Input()graduations?: string;

    // Value two way binding
    @Output() valueChange = new EventEmitter();
    @Input()
    get value() {
        return this._value;
    }

    set value(val: number) {
        val = Math.round(val * 100) / 100;
        if (val !== this._value) {
            this._value = val;
            this.valueChange.emit(this._value);
        }
    }

    // Container position
    public posX = 0;
    public posY = 0;

    // Container sizes
    private containerWidth = 0;
    private containerHeight = 0;

    // Slider extremities
    private startX = 0;
    private startY = 0;
    private endX = 0;
    private endY = 0;

    public graduationsObjs = [];
    private graduationHeight = 0;
    public graduationWidth = 0;
    private graduationMargin = 0;
    private angleMax = 0;
    private origineAngle = -90;

    public rotate = this.origineAngle;

    public handleWidth = 0;
    public handleHeight = 0;
    public handlePosX = 0;
    public handlePosY = 0;
    public handleRotateAxisX = 0;
    public handleRotateAxisY = 0;
    public originalGraduations = this.graduations;
    public originalSteps = this.steps;

    private stepAngle = 0;

    @HostListener('window:resize', ['$event']) onResize(event) { this.applySize(); }

    constructor(private parentEl: ElementRef) { }

    ngOnChanges() {
        if (this.graduations !== this.originalGraduations) {
            this.originalGraduations = this.graduations;
            this.drawLegends();
        }

        if (this.steps !== this.originalSteps) {
            this.originalSteps = this.steps;
            this.initSteps();
        }
    }

    ngOnInit() {

        this.initSteps();
        this.rotate = (-this.steps + (this.value * this.steps)) * this.stepAngle;

        this.valueChange.subscribe(() => {
            this.rotate = (-this.steps + (this.value * this.steps)) * this.stepAngle;
        });

    }

    initSteps() {
        if (! this.steps) {
            this.steps = 4;
        } else {
            this.steps = Number.parseInt(this.steps);
        }

        this.stepAngle = (this.angleMax - this.origineAngle) / this.steps;
    }

    ngAfterContentInit() {
        this.applySize();
    }

    private applySize() {

        const containerPos = this.parentEl.nativeElement.getBoundingClientRect();
        this.posX = containerPos.left;
        this.posY = containerPos.top;

        if (containerPos.width < containerPos.height) {
            this.containerWidth = this.containerHeight = containerPos.width;
        } else {
            this.containerWidth = this.containerHeight = containerPos.height;
        }

        if (this.graduations && this.graduations.length > 0) {
            this.graduationMargin = this.containerWidth / 12;
            this.graduationWidth = this.containerWidth / 30;
        }

        this.handleWidth = this.containerWidth - this.graduationMargin;
        this.handleHeight = this.containerHeight / 3;
        this.handleRotateAxisX = this.containerWidth - (this.handleHeight / 2) - this.graduationMargin;
        this.handleRotateAxisY = this.handleHeight / 2;

        this.startX = 0;
        this.startY = this.handleHeight / 2;

        this.endX = this.handleRotateAxisX;
        this.endY = this.handleWidth;

        this.drawLegends();

    }

    public onPanStart(event: any): void {
        const containerPos = this.parentEl.nativeElement.getBoundingClientRect();
        this.posX = containerPos.left;
        this.posY = containerPos.top;
    }

    public onPan(event: any): void {
        event.preventDefault();

        const currentAngle = this.getAngle(event.center.x - this.posX, event.center.y - this.posY);

        const curValue = (this.steps + Math.round((currentAngle / (this.stepAngle / 2)) / 2));
        if (curValue !== (this.value * this.steps)) {
            this.value = curValue / this.steps;
            this.rotate = (-this.steps + curValue) * this.stepAngle;
        }

    }

    private getAngle(x, y) {

        if (y < this.startY) {
            return 0;
        }

        if (x > this.endX) {
            return this.origineAngle;
        }

        const distA = Math.sqrt(
            Math.pow((this.handleRotateAxisX - this.startX), 2) + Math.pow((this.handleRotateAxisY - this.startY), 2)
        );
        const distB = Math.sqrt(
            Math.pow((this.handleRotateAxisX - x), 2) + Math.pow((this.handleRotateAxisY - y), 2)
        );
        const distC = Math.sqrt(
            Math.pow((this.startX - x), 2) + Math.pow((this.startY - y), 2)
        );

        const angle =  Math.acos((Math.pow(distA, 2) + Math.pow(distB, 2) - Math.pow(distC, 2)) / (2 * distA * distB));

        return (angle / (Math.PI / 180)) * -1;
    }

    private drawLegends() {

        if (this.graduations && this.graduations.length > 0) {

            const totalAngle = this.angleMax - this.origineAngle;
            const gradAngle = totalAngle / (this.graduations.length - 1);
            this.graduationsObjs = [];

            for (let i = 0; i < this.graduations.length; i++) {
                this.graduationsObjs.push({
                    legend: this.graduations[i],
                    top: this.handleRotateAxisY * 2,
                    left: this.handleRotateAxisX - this.graduationWidth / 2,
                    rotateX: this.graduationWidth / 2,
                    rotateY: -this.handleRotateAxisY,
                    rotate: -90 + gradAngle * i
                });
            }

        }
    }

}
