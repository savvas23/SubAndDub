import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogContentComponent {
  @Input() dialogGroup: FormGroup;
  @Input() index: number;
  @Input() dialogId: number;
  @Output() deleteDialogBoxEvent: EventEmitter<number> = new EventEmitter();
  @Output() startTimeValueValidation: EventEmitter<TimeEmitterObject> = new EventEmitter();
  @Output() endTimeValueValidation: EventEmitter<TimeEmitterObject> = new EventEmitter();



  getDialogControl(control: string): FormControl {
    return this.dialogGroup.get(control) as FormControl
  }

  deleteDialogBox(dialogId: number): void {
    this.deleteDialogBoxEvent.emit(dialogId);
  }

  emitStartTimeValue(): void {
    const EmitObject: TimeEmitterObject = {
      id: this.dialogId,
      value: this.getDialogControl('end_time').value
    };
    
    this.startTimeValueValidation.emit(EmitObject);
  }

  emitEndTimeValue(): void {
    const EmitObject: TimeEmitterObject = {
      id: this.dialogId,
      value: this.getDialogControl('end_time').value
    };

    this.endTimeValueValidation.emit(EmitObject);
  }
}

export interface TimeEmitterObject {
  id: number;
  value: string;
}