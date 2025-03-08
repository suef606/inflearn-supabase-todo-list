"use client";

// Material Tailwind 컴포넌트를 원래 이름으로 import
import { Button as MTButton, Input as MTInput } from "@material-tailwind/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createTodo, getTodos } from "actions/todo-actions";
import Todo from "./components/todo";
import { useState, ChangeEvent, ReactNode } from "react";

/**
 * Material Tailwind의 Input 컴포넌트를 위한 래퍼 컴포넌트
 * 타입스크립트 에러를 해결하기 위해 필요한 props만 정의합니다.
 */
interface CustomInputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
  className?: string;
  type?: string;
  placeholder?: string;
}

// Input 래퍼 컴포넌트 구현
function Input({ label, value, onChange, icon, className, type = "text", placeholder }: CustomInputProps) {
  // MTInput에 props를 전달하되, 타입 단언을 사용하여 타입 에러 회피
  return (
    <MTInput
      type={type}
      label={label}
      value={value}
      onChange={onChange}
      className={className}
      icon={icon}
      placeholder={placeholder}
      {...({} as any)} // 추가적인 타입 에러 방지
    />
  );
}

/**
 * Material Tailwind의 Button 컴포넌트를 위한 래퍼 컴포넌트
 * 타입스크립트 에러를 해결하기 위해 필요한 props만 정의합니다.
 */
interface CustomButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  loading?: boolean; // Material Tailwind 2.1.10 버전에서는 지원할 수도 있음
}

// Button 래퍼 컴포넌트 구현
function Button({ onClick, disabled, className, children, loading }: CustomButtonProps) {
  // MTButton에 props를 전달하되, 타입 단언을 사용하여 타입 에러 회피
  return (
    <MTButton
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...(loading !== undefined ? { loading } : {})} // loading prop이 존재하면 전달
      {...({} as any)} // 추가적인 타입 에러 방지
    >
      {children}
    </MTButton>
  );
}

// Todo 아이템의 인터페이스 정의 (Todo 컴포넌트와 일치해야 함)
interface TodoItem {
  id: string | number;
  title: string;
  completed: boolean;
}

export default function UI() {
  // 검색어를 저장하는 상태
  const [searchInput, setSearchInput] = useState("");

  // React Query를 사용하여 할 일 목록을 가져오는 쿼리
  const todosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: () => getTodos({ searchInput }),
  });

  // React Query의 useMutation을 사용하여 새 할 일을 생성하는 뮤테이션
  const createTodoMutation = useMutation({
    mutationFn: () =>
      createTodo({
        title: "New Todo",
        completed: false,
      }),

    onSuccess: () => {
      // 뮤테이션 성공 후 할 일 목록 다시 불러오기
      todosQuery.refetch();
    },
  });

  // 입력 필드의 값이 변경될 때 호출되는 함수
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="w-2/3 mx-auto flex flex-col items-center py-10 gap-2">
      <h1 className="text-xl">TODO LIST</h1>

      {/* 커스텀 Input 컴포넌트 사용 */}
      <div className="w-full">
        <Input
          label="Search TODO"
          placeholder="Search TODO"
          value={searchInput}
          onChange={handleInputChange}
          className="w-full"
          icon={<i className="fas fa-search" />}
        />
      </div>

      {/* 로딩 상태 표시 */}
      {todosQuery.isPending && <p>Loading...</p>}
      
      {/* 할 일 목록 렌더링 - 타입 단언으로 타입 안전성 보장 */}
      {todosQuery.data &&
        todosQuery.data.map((todo) => (
          <Todo key={todo.id} todo={todo as TodoItem} />
        ))}
      
      {/* 커스텀 Button 컴포넌트 사용 */}
      <Button 
        onClick={() => createTodoMutation.mutate()}
        loading={createTodoMutation.isPending}
        className="flex items-center gap-2"
      >
        <i className="fas fa-plus mr-2" />
        ADD TODO
      </Button>
    </div>
  );
}