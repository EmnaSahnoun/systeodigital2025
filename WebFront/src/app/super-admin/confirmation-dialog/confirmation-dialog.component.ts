import { Component, Inject, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  standalone: false
})
export class ConfirmationDialogComponent {
  @Input()username!: string;
  @Input()message!:string;
  constructor(
    public activeModal: NgbActiveModal,
  ) {}

  onConfirm(): void {
    this.activeModal.close(true);
  }

  onDismiss(): void {
    this.activeModal.dismiss(false);
  }
}
