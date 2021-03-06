import { Component, ViewChild, Input, ElementRef, AfterViewInit, AfterContentInit, OnChanges, EventEmitter } from '@angular/core';
import { FontLoaderService } from '../../font-loader.service';


@Component({
  selector: 'cui-classic-speed-gauge',
  templateUrl: './classic-speed-gauge.component.html',
  styleUrls: ['./classic-speed-gauge.component.css']
})
export class ClassicSpeedGaugeComponent implements AfterViewInit, AfterContentInit, OnChanges {
    @ViewChild('gauge') gauge: ElementRef;
    @ViewChild('gaugePointer') gaugePointer: ElementRef;
    @ViewChild('gaugeContainer') gaugeContainer: ElementRef;
    @Input() maxSpeed: number;
    @Input() unit?: string;
    @Input() value: number;

    public canvasWH = 800;
    private radius: number = this.canvasWH / 2;
    private outCircleWidth = 2; // Gauge border
    private graduateShadow = 5; // Shadow between graduation and gauge center
    private graduateLength = this.radius * 16 / 100;
    private fontReady = false;
    private onFontReady: EventEmitter<boolean>;
    private originalMaxSpeed = this.maxSpeed;
    private originalUnit = this.unit;

    // Graduation Angle
    private to = 65;
    private from = 295;
    public rotateValue = 0;

    private ctx: CanvasRenderingContext2D;
    private pointerCtx: CanvasRenderingContext2D;

    constructor(protected fontLoader: FontLoaderService) {

        this.onFontReady = new EventEmitter();
        this.fontLoader.load('Pathway Gothic One', 'google').then(() => {
            this.fontReady = true;
            this.onFontReady.emit(true);
        }).catch(() => {
            // Try to draw without font
            this.fontReady = true;
            this.onFontReady.emit(false);
        });

    }

    public setValue(_value) {

        _value = _value * 100;

        if (_value < 0) {
            _value = 0;
        }

        if (_value > 100) {
            _value = 100;
        }

        const range = this.from - this.to;

        this.rotateValue = _value * range / 100;

    }

    ngOnChanges() {
        this.setValue(this.value);

        if ( this.unit !== this.originalUnit || this.maxSpeed !== this.originalMaxSpeed ) {
            this.originalUnit = this.unit;
            this.originalMaxSpeed = this.maxSpeed;
            this.redraw();
        }

    }

    ngAfterContentInit() {
        this.ctx = this.gauge.nativeElement.getContext('2d');
        this.pointerCtx = this.gaugePointer.nativeElement.getContext('2d');
    }

    ngAfterViewInit() {
        this.setValue(this.value);
        this.redraw();
    }


    private redraw() {

        if (this.fontReady) {
            this.drawContainer();
            this.drawGraduations(this.maxSpeed / 2, 10, 5);
            this.drawPointer();
        } else {
            this.onFontReady.subscribe(() => {
                this.redraw();
            });
        }

    }

    private drawContainer() {

        const circleRadius = this.radius - this.outCircleWidth;

        const innerCircleRadius = circleRadius - this.graduateLength - this.graduateShadow;
        const radgrad = this.ctx.createRadialGradient(
          this.radius,
          this.radius,
          innerCircleRadius,
          this.radius,
          this.radius,
          innerCircleRadius + this.graduateShadow
        );
        radgrad.addColorStop(0, '#fff');
        radgrad.addColorStop(0.9, '#999');
        radgrad.addColorStop(1, '#fff');

        this.ctx.beginPath();
        this.ctx.arc(this.radius, this.radius, circleRadius, 0, Math.PI * 2, true);
        this.ctx.fillStyle = radgrad;
        this.ctx.lineWidth = this.outCircleWidth;
        this.ctx.fill();
        this.ctx.stroke();

        const topPos = ((this.radius / 2) * 3 + (this.radius * 0.10));
        const leftPos = (this.radius);

        this.ctx.font = (this.radius * 0.24) + 'px Pathway Gothic One';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText(this.unit || 'km/h', leftPos, topPos);

    }

    private drawPointer() {

        const circleRadius = this.radius - this.outCircleWidth - this.graduateLength - this.graduateShadow;
        let pointer;
        const pointerWidth = pointer = this.radius * 0.048;

        this.pointerCtx.beginPath();
        this.pointerCtx.strokeStyle = '#CC0000';

        this.pointerCtx.moveTo(
          this.radius + (pointerWidth - 2) * Math.sin(((this.from - 90) * (Math.PI / 180))),
          this.radius + (pointerWidth - 2) * Math.cos(((this.from - 90) * (Math.PI / 180)))
        );
        this.pointerCtx.lineTo(
          this.radius + (pointerWidth - 2) * Math.sin(((this.from + 90) * (Math.PI / 180))),
          this.radius + (pointerWidth - 2) * Math.cos(((this.from + 90) * (Math.PI / 180)))
        );
        this.pointerCtx.lineTo(
          this.radius + (circleRadius - pointer) * Math.sin(((this.from + 1.5) * (Math.PI / 180))),
          this.radius + (circleRadius - pointer) * Math.cos(((this.from + 1.5) * (Math.PI / 180)))
        );
        this.pointerCtx.lineTo(
          this.radius + circleRadius * Math.sin((this.from * (Math.PI / 180))),
          this.radius + circleRadius * Math.cos((this.from * (Math.PI / 180)))
        );
        this.pointerCtx.lineTo(
          this.radius + (circleRadius - pointer) * Math.sin(((this.from - 1.5) * (Math.PI / 180))),
          this.radius + (circleRadius - pointer) * Math.cos(((this.from - 1.5) * (Math.PI / 180)))
        );
        this.pointerCtx.closePath();

        const gradient = this.pointerCtx.createLinearGradient(
          this.radius + (pointerWidth - 2) * Math.sin(((this.from - 90) * (Math.PI / 180))),
          this.radius + (pointerWidth - 2) * Math.cos(((this.from - 90) * (Math.PI / 180))),
          this.radius + (pointerWidth - 2) * Math.sin(((this.from + 90) * (Math.PI / 180))),
          this.radius + (pointerWidth - 2) * Math.cos(((this.from + 90) * (Math.PI / 180)))
        );
        gradient.addColorStop(0.1, 'black');
        gradient.addColorStop(0.5, '#777');
        gradient.addColorStop(0.9, 'black');
        this.pointerCtx.fillStyle = gradient;

        this.pointerCtx.fill();

        const radgrad = this.ctx.createRadialGradient(
          this.radius,
          this.radius, (this.radius / 3) - 5,
          this.radius,
          this.radius,
          (this.radius / 3) - 5 + this.graduateShadow
        );
        radgrad.addColorStop(0, '#ccc');
        radgrad.addColorStop(1, '#666');
        // radgrad.addColorStop(1, '#fff');

        this.pointerCtx.beginPath();
        this.pointerCtx.arc(this.radius, this.radius, this.radius / 3, 0, Math.PI * 2, true);
        this.pointerCtx.fillStyle = radgrad;
        this.pointerCtx.fill();

    }

    private drawGraduations(_gradNumber: number, _main: number, _sub: number) {

        _gradNumber = _gradNumber + 1;

        if (_gradNumber < 2) {
            throw new Error('Analog gauge can\'t have less than 2 graduation');
        }

        const useableRange = this.from - this.to;
        const rangePart = useableRange / (_gradNumber - 1);

        const current = this.to;
        for (let i = 0; i < _gradNumber; i++) {

            let speedText = '';
            let style = 'normal';

            if (i % _sub === 0) {
                style = 'sub';
            }

            if (i % _main === 0) {
                style = 'main';
                speedText = (this.maxSpeed - ((this.maxSpeed * i) / (_gradNumber - 1))).toString();
            }

            if (i === _gradNumber - 1) {
                style = 'main';
                speedText = '0';
            }

            this.drawScale(this.to + (i * rangePart), style, speedText);
        }

    }

    private drawScale(_angle, _type: string, _speedText?: string) {

        const circleRadius = this.radius - this.outCircleWidth;
        const secCircleRadius = this.radius - this.graduateLength;
        const mainGraduateAngle = 2;

        switch (_type) {
            case 'normal':

                this.ctx.beginPath();
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(
                  this.radius + secCircleRadius * Math.sin((_angle * (Math.PI / 180))),
                  this.radius + secCircleRadius * Math.cos((_angle * (Math.PI / 180)))
                );
                this.ctx.lineTo(
                  this.radius + circleRadius * Math.sin((_angle * (Math.PI / 180))),
                  this.radius + circleRadius * Math.cos((_angle * (Math.PI / 180)))
                );
                this.ctx.stroke();

            break;
            case 'sub':

                this.ctx.beginPath();
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(
                  this.radius + secCircleRadius * Math.sin((_angle * (Math.PI / 180))),
                  this.radius + secCircleRadius * Math.cos((_angle * (Math.PI / 180)))
                );
                this.ctx.lineTo(
                  this.radius + circleRadius * Math.sin((_angle * (Math.PI / 180))),
                  this.radius + circleRadius * Math.cos((_angle * (Math.PI / 180)))
                );
                this.ctx.stroke();

            break;
            case 'main':

                this.ctx.beginPath();
                this.ctx.fillStyle = '#000000';
                this.ctx.moveTo(
                  this.radius + secCircleRadius * Math.sin((_angle * (Math.PI / 180))),
                  this.radius + secCircleRadius * Math.cos((_angle * (Math.PI / 180)))
                );
                this.ctx.lineTo(
                  this.radius + circleRadius * Math.sin(((_angle + (mainGraduateAngle / 2)) * (Math.PI / 180))),
                  this.radius + circleRadius * Math.cos(((_angle + (mainGraduateAngle / 2)) * (Math.PI / 180)))
                );
                this.ctx.lineTo(
                  this.radius + circleRadius * Math.sin(((_angle - (mainGraduateAngle / 2)) * (Math.PI / 180))),
                  this.radius + circleRadius * Math.cos(((_angle - (mainGraduateAngle / 2)) * (Math.PI / 180)))
                );
                this.ctx.closePath();
                this.ctx.fill();

                this.setMainGraduationValue(_angle, _speedText);

            break;

        }
    }

    private setMainGraduationValue(_angle, _speedText) {

        const circleRadius = this.radius - this.radius * 34 / 100;
        const fontSize = this.radius * 0.16;
        const textWidth = fontSize / 10 * 4 * 3;

        const topPos = this.radius + circleRadius * Math.cos((_angle * (Math.PI / 180))) + (fontSize / 2);
        const leftPos = this.radius + circleRadius * Math.sin((_angle * (Math.PI / 180)));

        this.ctx.font = fontSize + 'px Pathway Gothic One';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(_speedText, leftPos, topPos);

    }

}

