import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeService } from '../../app/services/type.service';

@Component({
  selector: 'app-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [style.backgroundColor]="color()" 
          class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase shadow-sm">
      {{type}}
    </span>
  `
})
export class TypeBadgeComponent {
  @Input({required: true}) type!: string;
  @Input() size!: string;
  typeService = inject(TypeService);
  color = computed(() => this.typeService.getColor(this.type));
}