import { Component, input } from '@angular/core';
import { Operation } from '../../services/operations-store';

/** Corps commun des popups « détail » des demandes et des opérations. */
@Component({
  selector: 'app-operation-details',
  imports: [],
  templateUrl: './operation-details.html',
})
export class OperationDetails {
  readonly op = input.required<Operation>();
}
