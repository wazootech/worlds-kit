import { DatasetSortable, Detail, SimpleRow, Source, Title, Todo } from "@wazootech/worlds-kit";

export default function App() {
  return <main id="todo-app">
    <aside className="source-list">
      <Source>
        <DatasetSortable itemId="lists" template={<SimpleRow editable />} addButton={<button className="big">Add a list</button>} />
      </Source>
    </aside>
    <section className="detail-view">
      <Detail>
        <Title />
        <DatasetSortable template={<Todo />} addButton={<button className="add-todo">Add a todo...</button>} />
      </Detail>
    </section>
  </main>;
}
