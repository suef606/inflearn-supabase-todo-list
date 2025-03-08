"use client";

import {
  Checkbox as MTCheckbox,
  IconButton as MTIconButton,
  Spinner as MTSpinner,
} from "@material-tailwind/react";
import { useMutation } from "@tanstack/react-query";
import { deleteTodo, updateTodo } from "actions/todo-actions";
import { queryClient } from "../config/ReactQueryClientProvider";
import { useState, ReactNode, ChangeEvent } from "react";

// 커스텀 Checkbox 래퍼 컴포넌트
interface CheckboxProps {
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

function Checkbox({ checked, onChange, className }: CheckboxProps) {
  return (
    <MTCheckbox
      checked={checked}
      onChange={onChange}
      className={className}
      {...({} as any)} // 타입 에러 방지
    />
  );
}

// 커스텀 IconButton 래퍼 컴포넌트
interface IconButtonProps {
  onClick: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
}

function IconButton({ onClick, children, className }: IconButtonProps) {
  return (
    <MTIconButton
      onClick={onClick as any}
      className={className}
      {...({} as any)} // 타입 에러 방지
    >
      {children}
    </MTIconButton>
  );
}

// 커스텀 Spinner 래퍼 컴포넌트
interface SpinnerProps {
  className?: string;
  color?: string;
}

function Spinner({ className, color }: SpinnerProps) {
  return (
    <MTSpinner
      className={className}
      color={color}
      {...({} as any)} // 타입 에러 방지
    />
  );
}

export default function Todo({ todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [completed, setCompleted] = useState(todo.completed);
  const [title, setTitle] = useState(todo.title);

  const updateTodoMutation = useMutation({
    mutationFn: () =>
      updateTodo({
        id: todo.id,
        title,
        completed,
      }),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: ["todos"],
      });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: () => deleteTodo(todo.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos"],
      });
    },
  });

  return (
    <div className="w-full flex items-center gap-1">
      <Checkbox
        checked={completed}
        onChange={async (e) => {
          await setCompleted(e.target.checked);
          await updateTodoMutation.mutate();
        }}
      />

      {isEditing ? (
        <input
          className="flex-1 border-b-black border-b pb-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      ) : (
        <p className={`flex-1 ${completed && "line-through"}`}>{title}</p>
      )}

      {isEditing ? (
        <IconButton
          onClick={async () => {
            await updateTodoMutation.mutate();
          }}
        >
          {updateTodoMutation.isPending ? (
            <Spinner />
          ) : (
            <i className="fas fa-check" />
          )}
        </IconButton>
      ) : (
        <IconButton onClick={() => setIsEditing(true)}>
          <i className="fas fa-pen" />
        </IconButton>
      )}
      <IconButton onClick={() => deleteTodoMutation.mutate()}>
        {deleteTodoMutation.isPending ? (
          <Spinner />
        ) : (
          <i className="fas fa-trash" />
        )}
      </IconButton>
    </div>
  );
}
