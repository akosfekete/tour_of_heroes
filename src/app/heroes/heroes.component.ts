import { Component, OnInit } from '@angular/core';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import {
  EMPTY,
  Subject,
  empty,
  interval,
  map,
  mapTo,
  merge,
  of,
  startWith,
  switchMap,
  takeWhile,
} from 'rxjs';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
})
export class HeroesComponent implements OnInit {
  heroes: Hero[] = [];
  // The initial time value in seconds
  initialTime = 60;

  // The formatted time to display
  formattedTime = '1:00';
  startSubject: Subject<boolean> = new Subject();
  stopSubject: Subject<boolean> = new Subject();

  constructor(private heroService: HeroService) {}

  ngOnInit(): void {
    this.getHeroes();
    this.setupTimer();
  }

  getHeroes(): void {
    this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes));
  }

  add(name: string): void {
    name = name.trim();
    if (!name) {
      return;
    }
    this.heroService.addHero({ name } as Hero).subscribe((hero) => {
      this.heroes.push(hero);
    });
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter((h) => h !== hero);
    this.heroService.deleteHero(hero.id).subscribe();
  }

  setupTimer() {
    const initialTime$ = of(this.initialTime);

    // Apply operators to transform and decrement the time value
    const timer$ = initialTime$.pipe(
      // Map the initial value to an Observable that emits decremented values every second
      switchMap((value) => interval(1000).pipe(map((i) => value - (i + 1)))),
      // Stop emitting values when the time reaches zero
      takeWhile((value) => value >= 0)
    );

    const button$ = merge(
      // Emit true when the start button is clicked
      this.startSubject.pipe(map(() => true)),
      // Emit false when the stop button is clicked
      this.stopSubject.pipe(map(() => false))
    ).pipe(
      // Set the initial value to false
      startWith(false)
    );

    // Apply operators to switch between the timer Observable and an empty Observable based on the button value
    const countdown$ = button$.pipe(
      // Switch between timer$ and empty() based on the button value
      switchMap((value) => (value ? timer$ : EMPTY))
    );

    countdown$.subscribe((value) => {
      // Convert the value to minutes and seconds format
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      this.formattedTime = `${minutes}:${
        seconds < 10 ? '0' + seconds : seconds
      }`;
    });
  }

  stopTimer() {
    this.stopSubject.next(true);
  }

  startTimer() {
    this.startSubject.next(true);
  }
}
