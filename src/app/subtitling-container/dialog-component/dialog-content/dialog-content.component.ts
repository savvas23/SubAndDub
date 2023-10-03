import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.css'],
})
export class DialogContentComponent {
  @Input() dialogGroup: FormGroup;
  @Input() index: number;
  @Input() dialogId: number;
  @Output() deleteDialogBoxEvent: EventEmitter<number> = new EventEmitter();
  @Output() dialogEmitter: EventEmitter<TimeEmitterObject> = new EventEmitter();



  getDialogControl(control: string): FormControl {
    return this.dialogGroup.get(control) as FormControl
  }

  deleteDialogBox(dialogId: number): void {
    this.deleteDialogBoxEvent.emit(dialogId);
  }

  emitDialogId(originControl: string): void {
    const EmitObject: TimeEmitterObject = {
      id: this.dialogId,
      control: originControl
    }
    this.dialogEmitter.emit(EmitObject);
  }

}

export interface TimeEmitterObject {
  id: number;
  control: string;
}