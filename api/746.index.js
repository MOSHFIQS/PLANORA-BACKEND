"use strict";
exports.id = 746;
exports.ids = [746];
exports.modules = {

/***/ 11746:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BunSqliteDialect: () => (/* binding */ BunSqliteDialect)
/* harmony export */ });
/* harmony import */ var _sqlite_introspector_DeY_XxNH_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(18118);
/* harmony import */ var kysely__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(16600);
/* harmony import */ var kysely__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(59290);


// src/bun-sqlite-dialect.ts
var BunSqliteAdapter = class {
	get supportsCreateIfNotExists() {
		return true;
	}
	get supportsTransactionalDdl() {
		return false;
	}
	get supportsReturning() {
		return true;
	}
	async acquireMigrationLock() {}
	async releaseMigrationLock() {}
	get supportsOutput() {
		return true;
	}
};
var BunSqliteDriver = class {
	#config;
	#connectionMutex = new ConnectionMutex();
	#db;
	#connection;
	constructor(config) {
		this.#config = { ...config };
	}
	async init() {
		this.#db = this.#config.database;
		this.#connection = new BunSqliteConnection(this.#db);
		if (this.#config.onCreateConnection) await this.#config.onCreateConnection(this.#connection);
	}
	async acquireConnection() {
		await this.#connectionMutex.lock();
		return this.#connection;
	}
	async beginTransaction(connection) {
		await connection.executeQuery(kysely__WEBPACK_IMPORTED_MODULE_0__/* .CompiledQuery */ .E.raw("begin"));
	}
	async commitTransaction(connection) {
		await connection.executeQuery(kysely__WEBPACK_IMPORTED_MODULE_0__/* .CompiledQuery */ .E.raw("commit"));
	}
	async rollbackTransaction(connection) {
		await connection.executeQuery(kysely__WEBPACK_IMPORTED_MODULE_0__/* .CompiledQuery */ .E.raw("rollback"));
	}
	async releaseConnection() {
		this.#connectionMutex.unlock();
	}
	async destroy() {
		this.#db?.close();
	}
};
var BunSqliteConnection = class {
	#db;
	constructor(db) {
		this.#db = db;
	}
	executeQuery(compiledQuery) {
		const { sql, parameters } = compiledQuery;
		const stmt = this.#db.prepare(sql);
		const params = parameters;
		if (stmt.columnNames.length > 0) return Promise.resolve({ rows: stmt.all(...params) });
		const { changes, lastInsertRowid } = stmt.run(...params);
		return Promise.resolve({
			rows: [],
			numAffectedRows: BigInt(changes),
			insertId: typeof lastInsertRowid === "bigint" ? lastInsertRowid : BigInt(lastInsertRowid)
		});
	}
	async *streamQuery() {
		throw new Error("Streaming query is not supported by SQLite driver.");
	}
};
var ConnectionMutex = class {
	#promise;
	#resolve;
	async lock() {
		while (this.#promise !== void 0) await this.#promise;
		this.#promise = new Promise((resolve) => {
			this.#resolve = resolve;
		});
	}
	unlock() {
		const resolve = this.#resolve;
		this.#promise = void 0;
		this.#resolve = void 0;
		resolve?.();
	}
};
var BunSqliteQueryCompiler = class extends kysely__WEBPACK_IMPORTED_MODULE_1__/* .DefaultQueryCompiler */ .n {
	getCurrentParameterPlaceholder() {
		return "?";
	}
	getLeftIdentifierWrapper() {
		return "\"";
	}
	getRightIdentifierWrapper() {
		return "\"";
	}
	getAutoIncrement() {
		return "autoincrement";
	}
};
var BunSqliteDialect = class {
	#config;
	constructor(config) {
		this.#config = { ...config };
	}
	createDriver() {
		return new BunSqliteDriver(this.#config);
	}
	createQueryCompiler() {
		return new BunSqliteQueryCompiler();
	}
	createAdapter() {
		return new BunSqliteAdapter();
	}
	createIntrospector(db) {
		return (0,_sqlite_introspector_DeY_XxNH_mjs__WEBPACK_IMPORTED_MODULE_2__.t)(db);
	}
};



/***/ })

};
;