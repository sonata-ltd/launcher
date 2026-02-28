interface ListNode<T> {
	key: string;
	data: T;
	prev: ListNode<T> | null;
	next: ListNode<T> | null;
}

export class DoublyLinkedList<T> {
	private head: ListNode<T> | null = null;
	private tail: ListNode<T> | null = null;
	private nodeMap: Map<string, ListNode<T>> = new Map();
	private _size: number = 0;

	/*
	 *  @param getKey - function to get unique key from element
	 */
	constructor(private getKey: (data: T) => string) {}

	get size(): number {
		return this._size;
	}

	get isEmpty(): boolean {
		return this._size === 0;
	}

	push(data: T): boolean {
		const key = this.getKey(data);

		if (this.nodeMap.has(key)) {
			return false;
		}

		const node: ListNode<T> = {
			key,
			data,
			prev: this.tail,
			next: null,
		};

		if (this.tail) this.tail.next = node;
		this.tail = node;
		if (!this.head) this.head = node;

		this.nodeMap.set(key, node);
		this._size++;

		return true;
	}

	/*
	 * Prepend to start (head) - O(1)
	 * @returns true if added, false if already exists
	 */
	unshift(data: T): boolean {
		const key = this.getKey(data);

		if (this.nodeMap.has(key)) {
			return false;
		}

		const node: ListNode<T> = {
			key,
			data,
			prev: null,
			next: this.head,
		};

		if (this.head) this.head.prev = node;
		this.head = node;
		if (!this.tail) this.tail = node;

		this.nodeMap.set(key, node);
		this._size++;

		return true;
	}

	removeNode(node: ListNode<T>): void {
		if (node.prev) {
			node.prev.next = node.next;
		} else {
			this.head = node.next;
		}

		if (node.next) {
			node.next.prev = node.prev;
		} else {
			this.tail = node.prev;
		}

		// Clear reference for GC
		node.prev = null;
		node.next = null;
	}

	remove(key: string): T | undefined {
		const node = this.nodeMap.get(key);

		if (!node) {
			return undefined;
		}

		this.removeNode(node);
		this.nodeMap.delete(key);
		this._size--;

		return node.data;
	}

	pop(): T | undefined {
		if (!this.tail) {
			return undefined;
		}

		const node = this.tail;
		const key = node.key;

		this.removeNode(node);
		this.nodeMap.delete(key);
		this._size--;

		return node.data;
	}

	shift(): T | undefined {
		if (!this.head) {
			return undefined;
		}

		const node = this.head;
		const key = node.key;

		this.removeNode(node);
		this.nodeMap.delete(key);
		this._size--;

		return node.data;
	}

	/**
	 * Move element to end — O(1)
	 * Used for focus (raise window to top)
	 * @returns true if moved, false if not found
	 */
	moveToEnd(key: string): boolean {
		const node = this.nodeMap.get(key);

		if (!node) {
			return false;
		}

		// Already at end
		if (node === this.tail) {
			return true;
		}

		// Detach from current position
		this.removeNode(node);

		// Attach to end
		node.prev = this.tail;
		node.next = null;

		if (this.tail) {
			this.tail.next = node;
		}

		this.tail = node;

		if (!this.head) {
			this.head = node;
		}

		return true;
	}

	/**
	 * Move element to start — O(1)
	 */
	moveToStart(key: string): boolean {
		const node = this.nodeMap.get(key);

		if (!node) {
			return false;
		}

		// Already at start
		if (node === this.head) {
			return true;
		}

		// Detach from current position
		this.removeNode(node);

		// Attach to start
		node.prev = null;
		node.next = this.head;

		if (this.head) {
			this.head.prev = node;
		}

		this.head = node;

		if (!this.tail) {
			this.tail = node;
		}

		return true;
	}

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// Access
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	/**
	 * Get element by key — O(1)
	 */
	get(key: string): T | undefined {
		return this.nodeMap.get(key)?.data;
	}

	/**
	 * Check existence — O(1)
	 */
	has(key: string): boolean {
		return this.nodeMap.has(key);
	}

	/**
	 * Get first element (head) — O(1)
	 */
	getFirst(): T | undefined {
		return this.head?.data;
	}

	/**
	 * Get last element (tail) — O(1)
	 */
	getLast(): T | undefined {
		return this.tail?.data;
	}

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// Clearing
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	/**
	 * Clear list — O(1)
	 */
	clear(): void {
		this.head = null;
		this.tail = null;
		this.nodeMap.clear();
		this._size = 0;
	}

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// Iteration
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	/**
	 * Iterator (head → tail)
	 */
	*[Symbol.iterator](): Generator<T> {
		let node = this.head;
		while (node) {
			yield node.data;
			node = node.next;
		}
	}

	/**
	 * Reverse iterator (tail → head)
	 */
	*reverse(): Generator<T> {
		let node = this.tail;
		while (node) {
			yield node.data;
			node = node.prev;
		}
	}

	/**
	 * forEach (head → tail)
	 */
	forEach(callback: (data: T, index: number) => void): void {
		let node = this.head;
		let index = 0;
		while (node) {
			callback(node.data, index);
			node = node.next;
			index++;
		}
	}

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// Conversion
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	/**
	 * Convert to array (head → tail) — O(n)
	 */
	toArray(): T[] {
		const result: T[] = [];
		for (const data of this) {
			result.push(data);
		}
		return result;
	}

	/**
	 * Convert to array of keys — O(n)
	 */
	keys(): string[] {
		const result: string[] = [];
		for (const data of this) {
			result.push(this.getKey(data));
		}
		return result;
	}

	/**
	 * Convert to reversed array — O(n)
	 */
	toArrayReversed(): T[] {
		const result: T[] = [];
		for (const data of this.reverse()) {
			result.push(data);
		}
		return result;
	}

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// Search
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	/**
	 * Find element by predicate — O(n)
	 */
	find(predicate: (data: T) => boolean): T | undefined {
		for (const data of this) {
			if (predicate(data)) {
				return data;
			}
		}
		return undefined;
	}

	/**
	 * Find element from end — O(n)
	 */
	findLast(predicate: (data: T) => boolean): T | undefined {
		for (const data of this.reverse()) {
			if (predicate(data)) {
				return data;
			}
		}
		return undefined;
	}

	/**
	 * Check if any element satisfies predicate — O(n)
	 */
	some(predicate: (data: T) => boolean): boolean {
		for (const data of this) {
			if (predicate(data)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Check if all elements satisfy predicate — O(n)
	 */
	every(predicate: (data: T) => boolean): boolean {
		for (const data of this) {
			if (!predicate(data)) {
				return false;
			}
		}
		return true;
	}
}
