import { Component, input, output } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  imports: [],
  templateUrl: './data-table.html',
})
export class DataTable {
  readonly columns = input.required<DataTableColumn[]>();
  readonly minWidth = input(640);
  readonly bare = input(false);
  readonly sortKey = input<string | null>(null);
  readonly sortAsc = input(true);
  readonly sortChange = output<string>();

  protected onSort(key: string): void {
    this.sortChange.emit(key);
  }
}
